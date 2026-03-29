import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createProduct, createProductReview, deleteProduct, getProduct, listProductReviews, listProducts, updateProduct } from '../services/productService';

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const vendorId = typeof req.query.vendorId === 'string' ? Number(req.query.vendorId) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const featured = typeof req.query.featured === 'string' ? req.query.featured === 'true' : undefined;
    const products = await listProducts({ category, vendorId, search, featured });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await createProduct(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await updateProduct(Number(req.params.id), req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteProduct(Number(req.params.id));
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}

export async function listReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await listProductReviews(Number(req.params.id));
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const review = await createProductReview(Number(req.params.id), req.user!, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}
