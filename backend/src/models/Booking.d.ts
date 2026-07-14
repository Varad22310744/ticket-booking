import mongoose, { Document } from 'mongoose';
export interface IBooking extends Document {
    bookingRef: string;
    customer: mongoose.Types.ObjectId;
    event: mongoose.Types.ObjectId;
    seats: mongoose.Types.ObjectId[];
    totalAmount: number;
    status: 'confirmed' | 'cancelled';
    createdAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, Document<unknown, {}, IBooking, {}, mongoose.DefaultSchemaOptions> & IBooking & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBooking>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map