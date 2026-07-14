import { Router } from 'express';
import { getEventRevenue } from '../controllers/organiser.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/events/:eventId/revenue', verifyToken, requireRole('organiser'), getEventRevenue);

export default router;