import Seat from '../models/Seat';
import { holdSeat, releaseSeat } from '../services/seatHoldService';
import { io } from '../server'; // socket instance, next step
export const getSeatsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const seats = await Seat.find({ event: eventId }).sort({ row: 1, number: 1 });
        res.status(200).json(seats);
    }
    catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
};
export const holdSeatController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await holdSeat(id, req.user.id);
        if (!result.success) {
            return res.status(409).json({ message: result.message }); // 409 = conflict, seat taken
        }
        // notify all connected clients seat status changed
        const seat = await Seat.findById(id);
        io.to(`event_${seat?.event}`).emit('seatUpdate', { seatId: id, status: 'held' });
        res.status(200).json({ message: result.message });
    }
    catch (err) {
        res.status(500).json({ message: 'Hold failed', error: err.message });
    }
};
export const releaseSeatController = async (req, res) => {
    try {
        const id = req.params.id;
        const seat = await Seat.findById(id);
        await releaseSeat(id, req.user.id);
        io.to(`event_${seat?.event}`).emit('seatUpdate', { seatId: id, status: 'available' });
        res.status(200).json({ message: 'Seat released' });
    }
    catch (err) {
        res.status(500).json({ message: 'Release failed', error: err.message });
    }
};
//# sourceMappingURL=seat.controller.js.map