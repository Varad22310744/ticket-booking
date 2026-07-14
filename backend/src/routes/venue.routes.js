import { Router } from 'express';
import { createVenue, getVenues, getVenueById } from '../controllers/venue.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
const router = Router();
router.post('/', verifyToken, requireRole('admin', 'organiser'), createVenue);
router.get('/', verifyToken, getVenues);
router.get('/:id', verifyToken, getVenueById);
export default router;
//# sourceMappingURL=venue.routes.js.map