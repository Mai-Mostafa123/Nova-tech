import { Router } from 'express';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';
import { changeStatus, listAllOrders, listMyOrders, listVendorOrders, placeOrder } from '../controllers/orderController';

const router = Router();

router.use(authenticateJWT);
router.post('/', placeOrder);
router.get('/me', listMyOrders);
router.get('/vendor/me', authorizeRole(['vendor', 'admin']), listVendorOrders);
router.get('/', authorizeRole(['admin']), listAllOrders);
router.patch('/:id/status', authorizeRole(['admin']), changeStatus);

export default router;
