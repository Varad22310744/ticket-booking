import mongoose, { Schema } from 'mongoose';
const BookingSchema = new Schema({
    bookingRef: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Booking', BookingSchema);
//# sourceMappingURL=Booking.js.map