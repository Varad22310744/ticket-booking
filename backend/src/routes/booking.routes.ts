import { Router } from 'express';
import { confirmBooking, getMyBookings } from '../controllers/booking.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { cancelBooking } from '../controllers/booking.controller';
const router = Router();

router.post('/confirm', verifyToken, requireRole('customer'), confirmBooking);
router.get('/my', verifyToken, requireRole('customer'), getMyBookings);
router.post('/:bookingId/cancel', verifyToken, requireRole('customer'), cancelBooking);
export default router;