import { Router } from 'express';
import { authorizeRole, authenticateJWT } from '../middlewares/authMiddleware';
import { create, createReview, getById, listAll, listReviews, remove, update } from '../controllers/productController';

const router = Router();

router.get('/', listAll);
router.get('/:id', getById);
router.get('/:id/reviews', listReviews);
router.post('/:id/reviews', authenticateJWT, createReview);
router.post('/', authenticateJWT, authorizeRole(['admin', 'vendor']), create);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'vendor']), update);
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'vendor']), remove);

export default router;
