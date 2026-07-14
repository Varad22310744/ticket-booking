# System Design Write-up: Ticket Booking System

## 1. Seat Hold and TTL Mechanism

When a customer selects a seat, the system must temporarily reserve it without permanently committing it, since the customer may abandon checkout. This is solved using a two-store approach: **Redis** for the time-bound lock, **MongoDB** for the durable seat record.

On seat selection, the backend issues a single atomic Redis command: `SET seat_lock:{seatId} {userId} EX 600 NX`. The `EX 600` flag gives the key a 10-minute self-expiring lifetime, and `NX` ("set if not exists") ensures the command only succeeds if no lock currently exists for that seat. If the command succeeds, the corresponding MongoDB `Seat` document is updated to `status: held`, along with `heldBy` (the customer) and `holdExpiresAt` (a computed timestamp for the frontend/display layer).

Alongside this, a **BullMQ** delayed job is scheduled with the same 10-minute delay, keyed by a deterministic job ID (`hold-{seatId}`). When the delay elapses, a background worker checks whether the seat is still `held` by the same user (it may have already been booked, in which case the job becomes a safe no-op) and, if so, reverts the seat to `available`, clears the hold fields, and emits a Socket.io event so every client viewing that event's seat map updates instantly. If the customer completes checkout before expiry, the booking service instead calls `job.remove()` to cancel the scheduled release, since the seat has now moved to a permanent `booked` state.

This dual mechanism — Redis for the atomic gate, BullMQ for scheduled cleanup — avoids relying on client-side timers (unreliable, don't survive restarts) or DB cron polling (adds latency and load).

## 2. Concurrency Prevention

The critical requirement is that two customers attempting to select the same seat at the same instant must not both succeed. This is where Redis's `NX` flag matters: Redis processes commands from all clients through a single-threaded event loop, so even under heavy concurrent load, only one `SET ... NX` call can ever succeed for a given key — the second caller receives `null` and is rejected immediately, before any database write happens.

This Redis lock is the primary gate, but the MongoDB update adds a second layer: the query is scoped as `findOneAndUpdate({ _id: seatId, status: 'available' }, { status: 'held', ... })`. If the Redis check somehow passed while the Mongo document was already non-available, this filter blocks the write, and the Redis lock is rolled back to keep both stores consistent. Together, these two checks guarantee a seat can never be simultaneously held or booked by two customers.

## 3. Waitlist Auto-Assignment Flow

When every seat in a category is booked, customers can join a category-level waitlist rather than a seat-specific one, since we don't know in advance which seat will free up. Each waitlist entry records `event`, `category`, `customer`, and `joinedAt`, and entries are always processed in FIFO order via `sort({ joinedAt: 1 })`.

When a booking is cancelled, the affected seat is first reverted to `available`, and then the system queries for the oldest `waiting` entry in that event/category. If one exists, the seat is immediately moved back to a `held` state — but this time `heldBy` is set to the waitlisted customer rather than being left open to the general public, and the waitlist entry's status changes to `offered`. This reuses the exact same seat-hold machinery already built for regular customers, keeping the codebase consistent rather than introducing a parallel data model.

## 4. Time-Limited Offer Handling

Because an "offer" is really just a specialized hold, it uses the same TTL pattern described above, but with a shorter, separately configurable window (5 minutes by default) and its own BullMQ queue (`offerExpiry`). At offer creation, the customer receives an email containing a unique link (`/waitlist-offer/{waitlistId}`) that routes them to a page where they can complete the booking for that specific seat.

If the customer accepts within the window, the booking is created normally (QR code generated, confirmation email sent), the waitlist entry is marked `fulfilled`, and the scheduled expiry job is cancelled. If the window lapses without action, the worker marks the entry `expired`, releases the seat back to `available`, and immediately re-invokes the same assignment function to offer it to the next customer in the FIFO queue — creating a cascading chain that continues until either someone accepts or the queue is empty. This recursive reuse of one function for both the initial offer and every subsequent cascade keeps the waitlist logic small, testable, and consistent regardless of how many customers are skipped over.

## Summary

Redis, MongoDB, and BullMQ each do one job: Redis provides atomic, self-expiring locks for concurrency safety; MongoDB holds the durable source of truth; BullMQ handles all time-based transitions without fragile in-memory timers. Socket.io layers real-time visibility on top, so every state change — hold, release, booking, cancellation, waitlist offer — reflects live on every connected client's seat map.