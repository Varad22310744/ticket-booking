import { redisClient } from '../config/redis';
import Seat from '../models/Seat';
import { holdExpiryQueue, cancelHoldExpiry } from '../jobs/holdExpiry.job';
const HOLD_TTL_SECONDS = 600; // 10 min, configurable
export const holdSeat = async (seatId, userId) => {
    const lockKey = `seat_lock:${seatId}`;
    // atomic: only succeeds if key doesn't already exist
    const lockAcquired = await redisClient.set(lockKey, userId, 'EX', HOLD_TTL_SECONDS, 'NX');
    if (!lockAcquired) {
        return { success: false, message: 'Seat already held or booked' };
    }
    // Redis lock got — now update Mongo, but double-check status too (defense in depth)
    const holdExpiresAt = new Date(Date.now() + HOLD_TTL_SECONDS * 1000);
    const updated = await Seat.findOneAndUpdate({ _id: seatId, status: 'available' }, { status: 'held', heldBy: userId, holdExpiresAt }, { new: true });
    if (!updated) {
        // Mongo said not available (edge case) — release Redis lock, reject
        await redisClient.del(lockKey);
        return { success: false, message: 'Seat not available' };
    }
    // clear any stale jobs for this seat just in case
    await cancelHoldExpiry(seatId);
    // schedule auto-release job
    await holdExpiryQueue.add('release-seat', { seatId, userId }, { delay: HOLD_TTL_SECONDS * 1000, jobId: `hold-${seatId}` });
    return { success: true, message: 'Seat held successfully' };
};
export const releaseSeat = async (seatId, userId) => {
    const lockKey = `seat_lock:${seatId}`;
    await redisClient.del(lockKey);
    await Seat.findOneAndUpdate({ _id: seatId, status: 'held' }, { status: 'available', heldBy: null, holdExpiresAt: null });
    // immediately cancel the background expiry job so it doesn't block future holds
    await cancelHoldExpiry(seatId);
};
//# sourceMappingURL=seatHoldService.js.map