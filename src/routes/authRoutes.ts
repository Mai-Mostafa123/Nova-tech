import { Router } from 'express';
import { login, logout, me, register, resendCode, socialAuth, updateProfile, verifyCode } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyCode);
router.post('/resend-otp', resendCode);
router.post('/social', socialAuth);
router.post('/logout', authenticateJWT, logout);
router.get('/me', authenticateJWT, me);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
