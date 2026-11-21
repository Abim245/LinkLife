import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/valid.js';
import { getInventory, updateInventory, regionalShortages, updateSchema } from '../controllers/inventory.js';

const router = Router();
router.use(auth);

router.get('/', requireRole('hospital', 'bloodbank'), getInventory);
router.patch('/', requireRole('hospital', 'bloodbank'), validate(updateSchema), updateInventory);
router.get('/shortages', requireRole('hospital', 'bloodbank', 'admin'), regionalShortages);

export default router;