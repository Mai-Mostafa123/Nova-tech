import { Router } from 'express';
import { overview } from '../controllers/vendorController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJWT, authorizeRole(['vendor', 'admin']));
router.get('/overview', overview);

export default router;
