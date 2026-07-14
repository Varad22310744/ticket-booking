@"
# Ticket Booking System

Full-stack ticket booking platform for movies and concerts with real-time seat maps, TTL-based seat holds, concurrency-safe booking, and automatic waitlist management with QR-code email tickets.

## Tech Stack

**Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), Redis (Upstash), BullMQ, Socket.io, Nodemailer, qrcode
**Frontend:** React, TypeScript, Tailwind CSS, Socket.io-client, Axios, React Router
**Hosting :** Render (backend), Vercel (frontend), MongoDB Atlas, Upstash Redis

## Setup Guide

### Backend

```bash
cd backend
npm install
cp .env.example .env

npm run dev
```
Server runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```
App runs on `http://localhost:3000`

---

## Environment Variables

See `backend/.env.example`:
PORT=5000

FRONTEND_URL=http://localhost:3000

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign/verify JWT auth tokens |
| `REDIS_URL` | Upstash Redis connection string (TLS — `rediss://`) |
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | Gmail SMTP credentials for booking/waitlist emails |
| `FRONTEND_URL` | Used to build waitlist offer links embedded in emails |

---

## Database Schema

**User**
| Field | Type | Notes |
|---|---|---|
| name | String | |
| email | String | unique |
| password | String | bcrypt hashed |
| role | Enum | customer / organiser / admin |

**Venue**
| Field | Type | Notes |
|---|---|---|
| name | String | |
| address | String | |
| categories | Array | e.g. Premium, Standard |
| seatLayout | Array | { row, number, category } |
| createdBy | ObjectId | ref: User (admin) |

**Event**
| Field | Type | Notes |
|---|---|---|
| title | String | |
| type | Enum | movie / concert |
| venue | ObjectId | ref: Venue |
| organiser | ObjectId | ref: User |
| date, time | Date, String | |
| pricing | Array | { category, price } |

**Seat**
| Field | Type | Notes |
|---|---|---|
| event | ObjectId | ref: Event |
| row, number, category | String, Number, String | |
| status | Enum | available / held / booked |
| heldBy | ObjectId | ref: User |
| holdExpiresAt | Date | |
| bookingId | ObjectId | ref: Booking |

**Booking**
| Field | Type | Notes |
|---|---|---|
| bookingRef | String | unique, encoded in QR |
| customer | ObjectId | ref: User |
| event | ObjectId | ref: Event |
| seats | Array | ref: Seat |
| totalAmount | Number | |
| status | Enum | confirmed / cancelled |

**Waitlist**
| Field | Type | Notes |
|---|---|---|
| event | ObjectId | ref: Event |
| category | String | |
| customer | ObjectId | ref: User |
| status | Enum | waiting / offered / fulfilled / expired |
| offerSeatId | ObjectId | ref: Seat |
| offerExpiresAt | Date | |
| joinedAt | Date | used for FIFO ordering |

---

## Seat Hold & TTL Mechanism

When a customer selects a seat:
1. Backend attempts an atomic Redis lock: `SET seat_lock:{seatId} {userId} EX 600 NX`
2. If lock succeeds, Mongo seat document is updated to `status: held`, with `heldBy` and `holdExpiresAt` set
3. A BullMQ delayed job (10 min) is scheduled to auto-release the seat
4. If checkout completes before expiry, the seat is marked `booked` and the scheduled job is cancelled
5. If checkout is abandoned, the job fires: seat reverts to `available`, and a Socket.io event notifies all clients viewing that event's seat map in real time

---

## Concurrency Protection

- Redis `SET ... NX` is atomic at the Redis engine level — when two requests race for the same seat, only one can succeed in acquiring the lock, regardless of timing
- MongoDB update is additionally scoped with `{ _id: seatId, status: 'available' }` as a defensive secondary check
- This two-layer guard ensures no two customers can simultaneously hold or book the same seat

---

## Waitlist & Auto-Assignment Logic

1. When a seat category is fully booked, customers can join a waitlist for that category (FIFO, ordered by `joinedAt`)
2. When a booking is cancelled, the freed seat is offered to the oldest waiting customer:
   - Seat is placed in `held` state for that customer
   - A 5-minute offer window begins (`offerExpiresAt`)
   - An email is sent with a time-limited link to complete the booking
3. If the customer accepts within the window, booking is confirmed normally (QR + email)
4. If the offer expires unaccepted, a BullMQ job:
   - Marks the waitlist entry as `expired`
   - Releases the seat
   - Recursively offers it to the next customer in the queue

---

## API Documentation

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Venue
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/venues` | Admin | Create venue + seat layout |
| GET | `/api/venues` | Authenticated | List venues |
| GET | `/api/venues/:id` | Authenticated | Get venue detail incl. seat layout |

### Event
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/events` | Organiser | Create event (auto-generates seats) |
| GET | `/api/events` | Authenticated | Browse/filter events (`?type=`, `?date=`) |
| GET | `/api/events/:id` | Authenticated | Get event detail |

### Seats
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/seats/event/:eventId` | Authenticated | Get seat map for event |
| POST | `/api/seats/:id/hold` | Customer | Hold a seat (TTL applies) |
| POST | `/api/seats/:id/release` | Customer | Manually release a held seat |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/bookings/confirm` | Customer | Confirm booking, sends QR email |
| GET | `/api/bookings/my` | Customer | View booking history |
| POST | `/api/bookings/:bookingId/cancel` | Customer | Cancel booking, triggers waitlist offer |

### Waitlist
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/waitlist/join` | Customer | Join waitlist for sold-out category |
| POST | `/api/waitlist/:waitlistId/accept` | Customer | Accept a waitlist offer |

### Organiser
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/organiser/events/:eventId/revenue` | Organiser | Booking summary and revenue for own event |

---

## Roles & Access Control

| Role | Capabilities |
|---|---|
| **Admin** | Create/manage venues and seat layouts |
| **Organiser** | Register, log in, create events, view own event's revenue/bookings |
| **Customer** | Register, log in, browse/filter events, book/cancel/waitlist seats, view booking history |

Access enforced via JWT (`verifyToken`) + role-check middleware (`requireRole`) on protected routes.

---
## Deployment

- **Live App:** https://ticket-booking-8n7k.vercel.app/
- **Backend API:** https://ticket-booking-5z2f.onrender.com



## Project Status

- ✅ Backend: complete — auth, venue, event, seat hold/TTL, concurrency lock, booking + QR + email, waitlist join/offer/cascade, organiser revenue
- ✅ Frontend: complete — auth pages, customer booking flow (browse, seat map, hold, checkout, history, cancel, waitlist), organiser dashboard
