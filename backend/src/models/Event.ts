import mongoose, { Document, Schema } from 'mongoose';

interface IPricing {
    category: string;
    price: number;
}

export interface IEvent extends Document {
    title: string;
    type: 'movie' | 'concert';
    venue: mongoose.Types.ObjectId;
    organiser: mongoose.Types.ObjectId;
    date: Date;
    time: string;
    pricing: IPricing[];
    createdAt: Date;
}

const PricingSchema = new Schema<IPricing>({
    category: { type: String, required: true },
    price: { type: Number, required: true }
}, { _id: false });

const EventSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['movie', 'concert'], required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    pricing: { type: [PricingSchema], required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IEvent>('Event', EventSchema);