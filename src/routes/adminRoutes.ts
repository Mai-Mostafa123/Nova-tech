import { Router } from 'express';
import { overview, updateUser } from '../controllers/adminController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJWT, authorizeRole(['admin']));
router.get('/overview', overview);
router.patch('/users/:id', updateUser);

export default router;
