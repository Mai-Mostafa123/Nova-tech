import { Router } from 'express';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import cartRoutes from './cartRoutes';
import categoryRoutes from './categoryRoutes';
import orderRoutes from './orderRoutes';
import productRoutes from './productRoutes';
import vendorRoutes from './vendorRoutes';
import wishlistRoutes from './wishlistRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);
router.use('/vendor', vendorRoutes);

export default router;
