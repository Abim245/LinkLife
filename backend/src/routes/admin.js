import { overview } from '../controllers/admin.js';
const router = Router();
router.get('/overview', overview);
export default router;