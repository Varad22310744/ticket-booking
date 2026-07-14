import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Seat from '../models/Seat';
import Booking from '../models/Booking';
import Event from '../models/Event';
import User from '../models/User';
import { generateQRCode } from '../services/qrService';
import { sendBookingConfirmation } from '../services/emailService';
import { cancelHoldExpiry } from '../jobs/holdExpiry.job';
import { assignNextInWaitlist } from '../services/waitlistService';
import { io } from '../server';

const generateBookingRef = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
};

export const confirmBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { seatIds } = req.body; // array of seat ids customer held
        const userId = req.user!.id;

        // verify all seats held by THIS user, not expired
        const seats = await Seat.find({ _id: { $in: seatIds } }).populate('event');
        if (seats.length !== seatIds.length) {
            return res.status(404).json({ message: 'Some seats not found' });
        }

        for (const seat of seats) {
            if (seat.status !== 'held' || seat.heldBy?.toString() !== userId) {
                return res.status(409).json({ message: `Seat ${seat.row}${seat.number} not held by you or expired` });
            }
        }

        const event: any = seats[0].event;
        const pricing = event.pricing || [];
        const totalAmount = seats.reduce((sum, seat) => {
            const priceEntry = pricing?.find((p: any) => p.category === seat.category);
            return sum + (priceEntry ? priceEntry.price : 0);
        }, 0);

        const bookingRef = generateBookingRef();

        const booking = await Booking.create({
            bookingRef,
            customer: userId,
            event: event._id,
            seats: seatIds,
            totalAmount,
            status: 'confirmed'
        });

        // update all seats to booked, cancel their expiry jobs
        for (const seat of seats) {
            seat.status = 'booked';
            seat.bookingId = booking._id as any;
            seat.set('heldBy', undefined);
            seat.set('holdExpiresAt', undefined);
            await seat.save();
            await cancelHoldExpiry(seat._id.toString());

            io.to(`event_${event._id}`).emit('seatUpdate', { seatId: seat._id, status: 'booked' });
        }

        // generate QR + send email
        const user = await User.findById(userId);
        const qrDataUrl = await generateQRCode(bookingRef);
        const seatDetails = seats.map(s => `${s.row}${s.number} (${s.category})`).join(', ');

        await sendBookingConfirmation(user!.email, bookingRef, event.title, seatDetails, qrDataUrl);

        res.status(201).json({ booking, message: 'Booking confirmed, email sent' });
    } catch (err) {
        res.status(500).json({ message: 'Booking failed', error: (err as Error).message });
    }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking.find({ customer: req.user!.id })
            .populate('event')
            .populate('seats')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: (err as Error).message });
    }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user!.id;

        const booking = await Booking.findById(bookingId).populate('seats');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customer.toString() !== userId) {
            return res.status(403).json({ message: 'Not your booking' });
        }
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Already cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        const seats: any[] = booking.seats as any[];

        for (const seat of seats) {
            const eventId = seat.event.toString();
            const category = seat.category;
            const seatId = seat._id.toString();

            // free the seat first
            await Seat.findByIdAndUpdate(seatId, {
                status: 'available',
                heldBy: null,
                holdExpiresAt: null,
                bookingId: null
            });

            io.to(`event_${eventId}`).emit('seatUpdate', { seatId, status: 'available' });

            // check waitlist for this category, offer if anyone waiting
            await assignNextInWaitlist(eventId, category, seatId);

            // if assigned, seat status flips to held again — emit update
            const updatedSeat = await Seat.findById(seatId);
            if (updatedSeat?.status === 'held') {
                io.to(`event_${eventId}`).emit('seatUpdate', { seatId, status: 'held' });
            }
        }

        res.status(200).json({ message: 'Booking cancelled', booking });
    } catch (err) {
        res.status(500).json({ message: 'Cancellation failed', error: (err as Error).message });
    }
};