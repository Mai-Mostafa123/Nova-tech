import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getVendorOverview } from '../services/vendorService';

export async function overview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await getVendorOverview(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
