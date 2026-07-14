import { Queue } from 'bullmq';
export declare const offerExpiryQueue: Queue<any, any, string, any, any, string>;
export declare const cancelOfferExpiry: (waitlistId: string) => Promise<void>;
//# sourceMappingURL=offerExpiry.job.d.ts.map