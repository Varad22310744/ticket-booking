import mongoose, { Document } from 'mongoose';
interface ISeatLayout {
    row: string;
    number: number;
    category: string;
}
export interface IVenue extends Document {
    name: string;
    address: string;
    categories: {
        name: string;
    }[];
    seatLayout: ISeatLayout[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVenue, {}, {}, {}, Document<unknown, {}, IVenue, {}, mongoose.DefaultSchemaOptions> & IVenue & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVenue>;
export default _default;
//# sourceMappingURL=Venue.d.ts.map