import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlist extends Document {
    event: mongoose.Types.ObjectId;
    category: string;
    customer: mongoose.Types.ObjectId;
    status: 'waiting' | 'offered' | 'fulfilled' | 'expired';
    offerSeatId?: mongoose.Types.ObjectId;
    offerExpiresAt?: Date;
    joinedAt: Date;
}

const WaitlistSchema: Schema = new Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    category: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['waiting', 'offered', 'fulfilled', 'expired'],
        default: 'waiting'
    },
    offerSeatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', default: null },
    offerExpiresAt: { type: Date, default: null },
    joinedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);