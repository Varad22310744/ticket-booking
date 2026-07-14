import { Queue } from 'bullmq';
export declare const holdExpiryQueue: Queue<any, any, string, any, any, string>;
export declare const cancelHoldExpiry: (seatId: string) => Promise<void>;
//# sourceMappingURL=holdExpiry.job.d.ts.map