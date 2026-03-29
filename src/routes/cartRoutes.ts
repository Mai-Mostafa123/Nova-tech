import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { add, remove, update, viewCart } from '../controllers/cartController';

const router = Router();

router.use(authenticateJWT);
router.get('/', viewCart);
router.post('/', add);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
