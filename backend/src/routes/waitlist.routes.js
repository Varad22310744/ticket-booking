import { Router } from 'express';
import { joinWaitlist } from '../controllers/waitlist.controller';
import { acceptWaitlistOffer } from '../controllers/waitlistOffer.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
const router = Router();
router.post('/join', verifyToken, requireRole('customer'), joinWaitlist);
router.post('/:waitlistId/accept', verifyToken, requireRole('customer'), acceptWaitlistOffer);
export default router;
//# sourceMappingURL=waitlist.routes.js.map