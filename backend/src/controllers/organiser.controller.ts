import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Event from '../models/Event';
import Booking from '../models/Booking';

export const getEventRevenue = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const userId = req.user!.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.organiser.toString() !== userId) {
            return res.status(403).json({ message: 'Not your event' });
        }

        const bookings = await Booking.find({ event: eventId, status: 'confirmed' }).populate('seats');

        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalSeatsBooked = bookings.reduce((sum, b) => sum + b.seats.length, 0);
        const totalBookings = bookings.length;

        res.status(200).json({
            event: event.title,
            totalBookings,
            totalSeatsBooked,
            totalRevenue,
            bookings
        });
    } catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: (err as Error).message });
    }
};