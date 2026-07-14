import Event from '../models/Event';
import Seat from '../models/Seat';
export const createEvent = async (req, res) => {
    try {
        const { title, type, venue, date, time, pricing } = req.body;
        const event = await Event.create({
            title, type, venue, date, time, pricing,
            organiser: req.user.id
        });
        const Venue = (await import('../models/Venue')).default;
        const venueDoc = await Venue.findById(venue);
        if (!venueDoc)
            return res.status(404).json({ message: 'Venue not found' });
        const seatsToCreate = venueDoc.seatLayout.map((seat) => ({
            event: event._id,
            row: seat.row,
            number: seat.number,
            category: seat.category
        }));
        await Seat.insertMany(seatsToCreate);
        res.status(201).json(event);
    }
    catch (err) {
        res.status(500).json({ message: 'Event creation failed', error: err.message });
    }
};
export const getEvents = async (req, res) => {
    try {
        const { type, date } = req.query; // filter support
        const filter = {};
        if (type)
            filter.type = type;
        if (date)
            filter.date = new Date(date);
        const events = await Event.find(filter).populate('venue', 'name address');
        res.status(200).json(events);
    }
    catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
};
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('venue');
        if (!event)
            return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    }
    catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
};
//# sourceMappingURL=event.controller.js.map