import Waitlist from '../models/Waitlist';
import Seat from '../models/Seat';
import Event from '../models/Event';
import User from '../models/User';
import { sendWaitlistOffer } from './emailService';
import { offerExpiryQueue } from '../jobs/offerExpiry.job'; // next file

const OFFER_TTL_SECONDS = 300; // 5 min to accept offer, configurable

export const assignNextInWaitlist = async (eventId: string, category: string, seatId: string): Promise<void> => {
    // FIFO — oldest waiting entry first
    const nextEntry = await Waitlist.findOne({
        event: eventId,
        category,
        status: 'waiting'
    }).sort({ joinedAt: 1 });

    if (!nextEntry) {
        // nobody waiting, seat stays available (already set by caller)
        return;
    }

    const offerExpiresAt = new Date(Date.now() + OFFER_TTL_SECONDS * 1000);

    // mark seat as held for this waitlisted user (reuse held status + hold fields)
    await Seat.findByIdAndUpdate(seatId, {
        status: 'held',
        heldBy: nextEntry.customer,
        holdExpiresAt: offerExpiresAt
    });

    nextEntry.status = 'offered';
    nextEntry.offerSeatId = seatId as any;
    nextEntry.offerExpiresAt = offerExpiresAt;
    await nextEntry.save();

    // schedule offer expiry job
    await offerExpiryQueue.add(
        'offer-expire',
        { waitlistId: nextEntry._id.toString(), seatId, eventId, category },
        { delay: OFFER_TTL_SECONDS * 1000, jobId: `offer-${nextEntry._id}` }
    );

    // notify via email with time-limited link
    const user = await User.findById(nextEntry.customer);
    const event = await Event.findById(eventId);
    const offerLink = `${process.env.FRONTEND_URL}/waitlist-offer/${nextEntry._id}`;

    await sendWaitlistOffer(user!.email, event!.title, offerLink, OFFER_TTL_SECONDS / 60);
};