import Waitlist from '../models/Waitlist';
import Seat from '../models/Seat';
import Booking from '../models/Booking';
import Event from '../models/Event';
import User from '../models/User';
import { generateQRCode } from '../services/qrService';
import { sendBookingConfirmation } from '../services/emailService';
import { cancelOfferExpiry } from '../jobs/offerExpiry.job';
import { io } from '../server';
const generateBookingRef = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
};
export const acceptWaitlistOffer = async (req, res) => {
    try {
        const { waitlistId } = req.params;
        const userId = req.user.id;
        const entry = await Waitlist.findById(waitlistId);
        if (!entry)
            return res.status(404).json({ message: 'Offer not found' });
        if (entry.customer.toString() !== userId)
            return res.status(403).json({ message: 'Not your offer' });
        if (entry.status !== 'offered')
            return res.status(409).json({ message: 'Offer expired or already used' });
        if (entry.offerExpiresAt && entry.offerExpiresAt < new Date()) {
            return res.status(409).json({ message: 'Offer window expired' });
        }
        const seat = await Seat.findById(entry.offerSeatId);
        if (!seat)
            return res.status(404).json({ message: 'Seat not found' });
        const event = await Event.findById(entry.event);
        const pricing = event.pricing;
        const priceEntry = pricing.find((p) => p.category === seat.category);
        const totalAmount = priceEntry ? priceEntry.price : 0;
        const bookingRef = generateBookingRef();
        const booking = await Booking.create({
            bookingRef,
            customer: userId,
            event: entry.event,
            seats: [seat._id],
            totalAmount,
            status: 'confirmed'
        });
        seat.status = 'booked';
        seat.bookingId = booking._id;
        seat.set('heldBy', undefined);
        seat.set('holdExpiresAt', undefined);
        await seat.save();
        entry.status = 'fulfilled';
        await entry.save();
        await cancelOfferExpiry(waitlistId);
        io.to(`event_${entry.event}`).emit('seatUpdate', { seatId: seat._id, status: 'booked' });
        const user = await User.findById(userId);
        const qrDataUrl = await generateQRCode(bookingRef);
        const seatDetails = `${seat.row}${seat.number} (${seat.category})`;
        await sendBookingConfirmation(user.email, bookingRef, event.title, seatDetails, qrDataUrl);
        res.status(201).json({ booking, message: 'Booking confirmed from waitlist offer' });
    }
    catch (err) {
        res.status(500).json({ message: 'Accept offer failed', error: err.message });
    }
};
//# sourceMappingURL=waitlistOffer.controller.js.map