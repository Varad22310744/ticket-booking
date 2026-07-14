import mongoose, { Document } from 'mongoose';
export interface IWaitlist extends Document {
    event: mongoose.Types.ObjectId;
    category: string;
    customer: mongoose.Types.ObjectId;
    status: 'waiting' | 'offered' | 'fulfilled' | 'expired';
    offerSeatId?: mongoose.Types.ObjectId;
    offerExpiresAt?: Date;
    joinedAt: Date;
}
declare const _default: mongoose.Model<IWaitlist, {}, {}, {}, Document<unknown, {}, IWaitlist, {}, mongoose.DefaultSchemaOptions> & IWaitlist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWaitlist>;
export default _default;
//# sourceMappingURL=Waitlist.d.ts.map