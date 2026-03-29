import { NextFunction, Request, Response } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../services/categoryService';

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await listCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await updateCategory(Number(req.params.id), req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteCategory(Number(req.params.id));
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}
