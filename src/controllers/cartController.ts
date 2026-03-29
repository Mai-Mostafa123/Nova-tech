import { Response, NextFunction } from 'express';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../services/cartService';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function viewCart(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cart = await getCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function add(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { productId, quantity, selectedColor, selectedSize, selectedStorage } = req.body;
    const cart = await addToCart(req.user!.id, Number(productId), Number(quantity) || 1, {
      selectedColor,
      selectedSize,
      selectedStorage: selectedStorage ?? selectedSize,
    });
    res.status(201).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const itemId = Number(req.params.id);
    const cart = await updateCartItem(itemId, req.user!.id, Number(req.body.quantity) || 1);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const itemId = Number(req.params.id);
    await removeFromCart(itemId, req.user!.id);
    res.json({ success: true, message: 'Removed from cart' });
  } catch (error) {
    next(error);
  }
}
