import mongoose, { Document } from 'mongoose';
export interface ISeat extends Document {
    event: mongoose.Types.ObjectId;
    row: string;
    number: number;
    category: string;
    status: 'available' | 'held' | 'booked';
    heldBy?: mongoose.Types.ObjectId;
    holdExpiresAt?: Date;
    bookingId?: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<ISeat, {}, {}, {}, Document<unknown, {}, ISeat, {}, mongoose.DefaultSchemaOptions> & ISeat & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISeat>;
export default _default;
//# sourceMappingURL=Seat.d.ts.map