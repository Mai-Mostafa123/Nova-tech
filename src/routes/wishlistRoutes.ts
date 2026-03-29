import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { addWishlistItem, listWishlist, removeWishlistItem } from '../controllers/wishlistController';

const router = Router();

router.use(authenticateJWT);
router.get('/', listWishlist);
router.post('/', addWishlistItem);
router.delete('/:productId', removeWishlistItem);

export default router;
