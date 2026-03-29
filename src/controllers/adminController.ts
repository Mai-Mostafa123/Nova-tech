import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getAdminOverview, updateAdminUser } from '../services/adminService';

export async function overview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await getAdminOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await updateAdminUser(Number(req.params.id), req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
