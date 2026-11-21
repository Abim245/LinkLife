import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/valid.js';
import { getMe, updateMe, updateLocation, profileSchema, locationSchema } from '../controllers/donor.js';

const router = Router();
router.use(auth, requireRole('donor'));

router.get('/me', getMe);
router.patch('/me', validate(profileSchema), updateMe);
router.put('/me/location', validate(locationSchema), updateLocation);

export default router;