import { Request, Response, NextFunction } from 'express';
import { createOrder, getAllOrders, getOrders, getVendorOrders, updateOrderStatus } from '../services/orderService';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function placeOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const order = await createOrder(req.user!.id, paymentMethod, shippingAddress);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function listMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orders = await getOrders(req.user!.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function listAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orders = await getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function listVendorOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orders = await getVendorOrders(req.user!.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function changeStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await updateOrderStatus(Number(req.params.id), req.body.status);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}
