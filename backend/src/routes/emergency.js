import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/valid.js';
import {
  createEmergency, respond, closeEmergency, getEmergency, listEmergencies,
  createSchema, respondSchema, listOpenRequests
} from '../controllers/emergency.js';

const router = Router();
router.use(auth);

router.post('/', requireRole('hospital', 'bloodbank'), validate(createSchema), createEmergency);
router.get('/', listEmergencies);
router.get('/:id', getEmergency);
router.post('/:id/respond', requireRole('donor'), validate(respondSchema), respond);
router.patch('/:id/close', requireRole('hospital', 'bloodbank'), closeEmergency);
router.get('/open', requireRole('bloodbank', 'hospital', 'admin'), listOpenRequests);
export default router;