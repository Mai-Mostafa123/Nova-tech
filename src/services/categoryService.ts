import { mutateStore, readStore, slugify, takeNextId } from '../data/store';

export async function listCategories() {
  const data = readStore();
  return data.categories
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => ({
      ...category,
      children: data.categories.filter((item) => item.parentId === category.id),
      productsCount: data.products.filter((product) => product.categoryId === category.id).length,
    }));
}

export async function createCategory(payload: {
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  parentId?: number | null;
}) {
  return mutateStore((data) => {
    const now = new Date().toISOString();
    const category = {
      id: takeNextId(data, 'nextCategoryId'),
      name: payload.name.trim(),
      slug: payload.slug?.trim() || slugify(payload.name),
      image: payload.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
      description: payload.description?.trim() || `${payload.name} collection`,
      parentId: payload.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    data.categories.push(category);
    return category;
  });
}

export async function updateCategory(
  categoryId: number,
  payload: Partial<{
    name: string;
    slug: string;
    image: string;
    description: string;
    parentId: number | null;
  }>
) {
  return mutateStore((data) => {
    const category = data.categories.find((item) => item.id === categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    if (payload.name?.trim()) {
      category.name = payload.name.trim();
      category.slug = payload.slug?.trim() || slugify(payload.name);
      for (const product of data.products.filter((item) => item.categoryId === categoryId)) {
        product.category = category.name;
      }
    }

    if (payload.slug?.trim()) category.slug = payload.slug.trim();
    if (payload.image) category.image = payload.image;
    if (payload.description) category.description = payload.description.trim();
    if (payload.parentId !== undefined) category.parentId = payload.parentId;
    category.updatedAt = new Date().toISOString();
    return category;
  });
}

export async function deleteCategory(categoryId: number) {
  return mutateStore((data) => {
    const category = data.categories.find((item) => item.id === categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    const fallbackCategory = data.categories.find((item) => item.id !== categoryId) || category;
    data.categories = data.categories.filter((item) => item.id !== categoryId);
    for (const product of data.products.filter((item) => item.categoryId === categoryId)) {
      product.categoryId = fallbackCategory.id;
      product.category = fallbackCategory.name;
    }

    return true;
  });
}
