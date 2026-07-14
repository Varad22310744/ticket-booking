import mongoose, { Schema } from 'mongoose';
const SeatSchema = new Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true },
    status: {
        type: String,
        enum: ['available', 'held', 'booked'],
        default: 'available'
    },
    heldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    holdExpiresAt: { type: Date, default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
});
// Compound index — fast lookup + prevent duplicate seat for same event
SeatSchema.index({ event: 1, row: 1, number: 1 }, { unique: true });
export default mongoose.model('Seat', SeatSchema);
//# sourceMappingURL=Seat.js.map