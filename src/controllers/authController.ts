import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { 
  getUserById, 
  loginUser, 
  registerUser, 
  resendOtp, 
  socialLogin, 
  updateUserProfile, 
  verifyOtp 
} from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function verifyCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtp(email, otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resendCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const result = await resendOtp(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function socialAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { provider } = req.body;
    const result = await socialLogin(provider);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await getUserById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await updateUserProfile(req.user!.id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response) {
  res.json({ success: true, message: 'Logged out' });
}