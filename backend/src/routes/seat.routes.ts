import { Router } from 'express';
import { getSeatsByEvent, holdSeatController, releaseSeatController } from '../controllers/seat.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/event/:eventId', verifyToken, getSeatsByEvent);
router.post('/:id/hold', verifyToken, requireRole('customer'), holdSeatController);
router.post('/:id/release', verifyToken, requireRole('customer'), releaseSeatController);

export default router;