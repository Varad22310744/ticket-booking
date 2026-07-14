import Venue from '../models/Venue';
export const createVenue = async (req, res) => {
    try {
        const { name, address, categories, seatLayout } = req.body;
        const venue = await Venue.create({
            name,
            address,
            categories,
            seatLayout,
            createdBy: req.user.id
        });
        res.status(201).json(venue);
    }
    catch (err) {
        res.status(500).json({ message: 'Venue creation failed', error: err.message });
    }
};
export const getVenues = async (req, res) => {
    try {
        const venues = await Venue.find().select('-seatLayout'); // list view, skip heavy seat array
        res.status(200).json(venues);
    }
    catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
};
export const getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id); // full detail incl seatLayout
        if (!venue)
            return res.status(404).json({ message: 'Venue not found' });
        res.status(200).json(venue);
    }
    catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
};
//# sourceMappingURL=venue.controller.js.map