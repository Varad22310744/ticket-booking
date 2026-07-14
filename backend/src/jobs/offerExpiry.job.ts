import { Queue, Worker } from 'bullmq';
import Seat from '../models/Seat';
import Waitlist from '../models/Waitlist';

const redisUrl = process.env.REDIS_URL as string;

export const offerExpiryQueue = new Queue('offerExpiry', { connection: { url: redisUrl } as any });

const offerExpiryWorker = new Worker(
    'offerExpiry',
    async (job) => {
        const { waitlistId, seatId, eventId, category } = job.data;

        const waitlistEntry = await Waitlist.findById(waitlistId);
        // only act if still in 'offered' state (not already fulfilled by customer)
        if (!waitlistEntry || waitlistEntry.status !== 'offered') return;

        waitlistEntry.status = 'expired';
        await waitlistEntry.save();

        // release seat back
        await Seat.findByIdAndUpdate(seatId, {
            status: 'available',
            heldBy: null,
            holdExpiresAt: null
        });

        // dynamic import avoids circular dependency (waitlist.service imports this file)
        const { assignNextInWaitlist } = await import('../services/waitlistService');
        await assignNextInWaitlist(eventId, category, seatId);
    },
    { connection: { url: redisUrl } as any }
);

offerExpiryWorker.on('failed', (job, err) => {
    console.error(`Offer expiry job failed:`, err);
});

export const cancelOfferExpiry = async (waitlistId: string) => {
    const job = await offerExpiryQueue.getJob(`offer-${waitlistId}`);
    if (job) await job.remove();
};