import { Queue, Worker } from 'bullmq';
import { redisClient } from '../config/redis';
import Seat from '../models/Seat';
// Pass the ioredis instance directly to BullMQ (cast as any to avoid ioredis version mismatch types)
export const holdExpiryQueue = new Queue('holdExpiry', { connection: redisClient });
const holdExpiryWorker = new Worker('holdExpiry', async (job) => {
    const { seatId, userId } = job.data;
    const seat = await Seat.findById(seatId);
    if (seat && seat.status === 'held' && seat.heldBy?.toString() === userId) {
        seat.status = 'available';
        seat.set('heldBy', undefined);
        seat.set('holdExpiresAt', undefined);
        await seat.save();
        console.log(`Seat ${seatId} auto-released (hold expired)`);
    }
}, { connection: redisClient });
holdExpiryWorker.on('failed', (job, err) => {
    console.error(`Hold expiry job failed for seat ${job?.data?.seatId}:`, err);
});
export const cancelHoldExpiry = async (seatId) => {
    const job = await holdExpiryQueue.getJob(`hold-${seatId}`);
    if (job)
        await job.remove();
};
//# sourceMappingURL=holdExpiry.job.js.map