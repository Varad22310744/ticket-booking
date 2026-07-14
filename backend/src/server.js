import 'dotenv/config'; // Load env vars FIRST before any other imports
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import venueRoutes from './routes/venue.routes';
import eventRoutes from './routes/event.routes';
import seatRoutes from './routes/seat.routes';
import './config/redis'; // Side-effect import to ensure Redis connects
import bookingRoutes from './routes/booking.routes';
import waitlistRoutes from './routes/waitlist.routes';
import organiserRoutes from './routes/organiser.routes';
const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: { origin: '*' }
});
io.on('connection', (socket) => {
    socket.on('joinEvent', (eventId) => {
        socket.join(`event_${eventId}`);
    });
    socket.on('leaveEvent', (eventId) => {
        socket.leave(`event_${eventId}`);
    });
});
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/organiser', organiserRoutes);
// temp test route — confirms server alive
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server running' });
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
startServer();
//# sourceMappingURL=server.js.map