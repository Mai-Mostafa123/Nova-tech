import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { addToWishlist, getWishlist, removeFromWishlist } from '../services/wishlistService';

export async function listWishlist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const items = await getWishlist(req.user!.id);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function addWishlistItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const item = await addToWishlist(req.user!.id, Number(req.body.productId));
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function removeWishlistItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await removeFromWishlist(req.user!.id, Number(req.params.productId));
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
}
