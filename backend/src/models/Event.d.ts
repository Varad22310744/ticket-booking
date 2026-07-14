import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IEvent, {}, {}, {}, Document<unknown, {}, IEvent, {}, mongoose.DefaultSchemaOptions> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
export default _default;
//# sourceMappingURL=Event.d.ts.map