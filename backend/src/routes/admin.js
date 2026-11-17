import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { listPendingOrgs, verifyOrg } from '../controllers/admin.js';

const router = Router();
router.use(auth, requireRole('admin'));

router.get('/orgs/pending', listPendingOrgs);
router.patch('/orgs/:id/verify', verifyOrg);

export default router;