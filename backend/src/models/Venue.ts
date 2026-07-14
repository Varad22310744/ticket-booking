import mongoose, { Document, Schema } from 'mongoose';

interface ISeatLayout {
    row: string;        // e.g. "A", "B"
    number: number;      // e.g. 1, 2, 3
    category: string;    // e.g. "Premium", "Standard"
}

export interface IVenue extends Document {
    name: string;
    address: string;
    categories: { name: string; }[];  // e.g. [{name:"Premium"}, {name:"Standard"}]
    seatLayout: ISeatLayout[];
    createdBy: mongoose.Types.ObjectId; // admin who created it
    createdAt: Date;
}

const SeatLayoutSchema = new Schema<ISeatLayout>({
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true }
}, { _id: false });

const VenueSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    categories: [{ name: { type: String, required: true } }],
    seatLayout: { type: [SeatLayoutSchema], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVenue>('Venue', VenueSchema);