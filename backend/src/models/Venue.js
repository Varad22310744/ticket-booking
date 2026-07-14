import mongoose, { Schema } from 'mongoose';
const SeatLayoutSchema = new Schema({
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true }
}, { _id: false });
const VenueSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    categories: [{ name: { type: String, required: true } }],
    seatLayout: { type: [SeatLayoutSchema], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Venue', VenueSchema);
//# sourceMappingURL=Venue.js.map