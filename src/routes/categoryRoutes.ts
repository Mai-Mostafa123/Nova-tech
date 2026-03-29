import { Router } from 'express';
import { create, listAll, remove, update } from '../controllers/categoryController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', listAll);
router.post('/', authenticateJWT, authorizeRole(['admin']), create);
router.put('/:id', authenticateJWT, authorizeRole(['admin']), update);
router.delete('/:id', authenticateJWT, authorizeRole(['admin']), remove);

export default router;
