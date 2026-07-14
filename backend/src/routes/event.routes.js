import { Router } from 'express';
import { createEvent, getEvents, getEventById } from '../controllers/event.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
const router = Router();
router.post('/', verifyToken, requireRole('organiser'), createEvent);
router.get('/', verifyToken, getEvents);
router.get('/:id', verifyToken, getEventById);
export default router;
//# sourceMappingURL=event.routes.js.map