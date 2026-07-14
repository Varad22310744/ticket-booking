import mongoose, { Schema } from 'mongoose';
const PricingSchema = new Schema({
    category: { type: String, required: true },
    price: { type: Number, required: true }
}, { _id: false });
const EventSchema = new Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['movie', 'concert'], required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    pricing: { type: [PricingSchema], required: true },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Event', EventSchema);
//# sourceMappingURL=Event.js.map