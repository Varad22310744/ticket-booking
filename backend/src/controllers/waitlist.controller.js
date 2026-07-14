import Waitlist from '../models/Waitlist';
import Seat from '../models/Seat';
export const joinWaitlist = async (req, res) => {
    try {
        const { eventId, category } = req.body;
        const userId = req.user.id;
        // check category truly sold out (no available seats in that category)
        const availableCount = await Seat.countDocuments({ event: eventId, category, status: 'available' });
        if (availableCount > 0) {
            return res.status(400).json({ message: 'Seats still available, no need to waitlist' });
        }
        // prevent duplicate join
        const existing = await Waitlist.findOne({ event: eventId, category, customer: userId, status: { $in: ['waiting', 'offered'] } });
        if (existing) {
            return res.status(400).json({ message: 'Already on waitlist for this category' });
        }
        const entry = await Waitlist.create({ event: eventId, category, customer: userId });
        res.status(201).json(entry);
    }
    catch (err) {
        res.status(500).json({ message: 'Join waitlist failed', error: err.message });
    }
};
//# sourceMappingURL=waitlist.controller.js.map