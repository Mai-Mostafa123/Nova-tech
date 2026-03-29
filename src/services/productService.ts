import { mutateStore, readStore, slugify, takeNextId } from '../data/store';

function attachMetrics(productId: number, data = readStore()) {
  const reviews = data.reviews.filter((review) => review.productId === productId);
  const rating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 4.8;

  return {
    reviews,
    rating,
    reviewCount: reviews.length,
  };
}

function mapProduct(productId: number, data = readStore()) {
  const product = data.products.find((item) => item.id === productId);
  if (!product) {
    return null;
  }

  const category = data.categories.find((item) => item.id === product.categoryId);
  return {
    ...product,
    category: category?.name || product.category,
    categoryInfo: category || null,
    ...attachMetrics(product.id, data),
    inStock: product.stock > 0,
  };
}

export async function listProducts(filters?: {
  category?: string;
  vendorId?: number;
  search?: string;
  featured?: boolean;
  status?: 'active' | 'draft';
}) {
  const data = readStore();
  const search = filters?.search?.trim().toLowerCase();

  return data.products
    .filter((product) => {
      if (filters?.category) {
        const normalizedCategory = filters.category.toLowerCase();
        const category = data.categories.find((item) => item.id === product.categoryId);
        if (category?.slug !== normalizedCategory && product.category.toLowerCase() !== normalizedCategory) {
          return false;
        }
      }

      if (filters?.vendorId && product.vendorId !== filters.vendorId) return false;
      if (filters?.featured !== undefined && product.featured !== filters.featured) return false;
      if (filters?.status && product.status !== filters.status) return false;

      if (search) {
        const haystack = [
          product.name,
          product.description,
          product.brand,
          product.category,
          ...product.tags,
          ...product.colors,
          ...product.sizes,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    })
    .map((product) => mapProduct(product.id, data))
    .filter(Boolean);
}

export async function getProduct(productId: number) {
  return mapProduct(productId);
}

export async function createProduct(
  payload: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId?: number;
    category?: string;
    brand?: string;
    discount?: number;
    images?: string[];
    specifications?: Record<string, string>;
    freeShipping?: boolean;
    colors?: string[];
    sizes?: string[];
    tags?: string[];
    featured?: boolean;
  },
  actor?: { id: number }
) {
  return mutateStore((data) => {
    const now = new Date().toISOString();
    const category =
      data.categories.find((item) => item.id === Number(payload.categoryId)) ||
      data.categories.find((item) => item.slug === payload.category?.toLowerCase()) ||
      data.categories.find((item) => item.name.toLowerCase() === payload.category?.toLowerCase()) ||
      data.categories[0];

    const colors = payload.colors || [];
    const sizes = payload.sizes || [];
    const product = {
      id: takeNextId(data, 'nextProductId'),
      name: payload.name.trim(),
      slug: slugify(payload.name),
      description: payload.description?.trim() || '',
      price: Number(payload.price),
      currency: 'EGP',
      category: category.name,
      categoryId: category.id,
      brand: payload.brand || 'Velora',
      images: payload.images?.filter(Boolean)?.length ? payload.images.filter(Boolean) : ['https://picsum.photos/seed/velora-product/900/900'],
      vendorId: actor?.id ?? 2,
      stock: Number(payload.stock) || 0,
      specifications: payload.specifications || {},
      discount: Number(payload.discount) || 0,
      freeShipping: Boolean(payload.freeShipping),
      colors,
      sizes,
      tags: payload.tags?.length ? payload.tags : [category.slug, (payload.brand || 'velora').toLowerCase()],
      status: 'active' as const,
      badge: Number(payload.discount) > 0 ? 'sale' : 'new',
      featured: Boolean(payload.featured),
      variants: {
        colors,
        storage: sizes,
      },
      createdAt: now,
      updatedAt: now,
    };

    data.products.unshift(product);
    return mapProduct(product.id, data);
  });
}

export async function updateProduct(
  productId: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    brand: string;
    discount: number;
    images: string[];
    specifications: Record<string, string>;
    freeShipping: boolean;
    colors: string[];
    sizes: string[];
    tags: string[];
    featured: boolean;
    status: 'active' | 'draft';
  }>
) {
  return mutateStore((data) => {
    const product = data.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (payload.categoryId) {
      const category = data.categories.find((item) => item.id === Number(payload.categoryId));
      if (category) {
        product.categoryId = category.id;
        product.category = category.name;
      }
    }

    if (payload.name?.trim()) {
      product.name = payload.name.trim();
      product.slug = slugify(payload.name);
    }

    if (payload.description !== undefined) product.description = payload.description;
    if (payload.price !== undefined) product.price = Number(payload.price);
    if (payload.stock !== undefined) product.stock = Number(payload.stock);
    if (payload.brand !== undefined) product.brand = payload.brand;
    if (payload.discount !== undefined) product.discount = Number(payload.discount);
    if (payload.images?.length) product.images = payload.images.filter(Boolean);
    if (payload.specifications) product.specifications = payload.specifications;
    if (payload.freeShipping !== undefined) product.freeShipping = payload.freeShipping;
    if (payload.colors) product.colors = payload.colors;
    if (payload.sizes) product.sizes = payload.sizes;
    if (payload.tags) product.tags = payload.tags;
    if (payload.featured !== undefined) product.featured = payload.featured;
    if (payload.status) product.status = payload.status;
    product.badge = product.discount > 0 ? 'sale' : product.badge;
    product.variants = {
      colors: product.colors,
      storage: product.sizes,
      connectivity: product.variants?.connectivity || [],
    };
    product.updatedAt = new Date().toISOString();

    return mapProduct(product.id, data);
  });
}

export async function deleteProduct(productId: number) {
  return mutateStore((data) => {
    const productIndex = data.products.findIndex((item) => item.id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    data.products.splice(productIndex, 1);
    data.cartItems = data.cartItems.filter((item) => item.productId !== productId);
    data.wishlistItems = data.wishlistItems.filter((item) => item.productId !== productId);
    data.reviews = data.reviews.filter((item) => item.productId !== productId);
    return true;
  });
}

export async function listProductReviews(productId: number) {
  const data = readStore();

  return data.reviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((review) => {
      const user = data.users.find((item) => item.id === review.userId);
      return {
        ...review,
        customerId: review.userId,
        customerName: user?.name || 'Velora Customer',
      };
    });
}

export async function createProductReview(
  productId: number,
  user: { id: number; name?: string },
  payload: { rating: number; comment: string }
) {
  return mutateStore((data) => {
    const product = data.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const review = {
      id: takeNextId(data, 'nextReviewId'),
      userId: user.id,
      productId,
      rating: Math.min(5, Math.max(1, Number(payload.rating) || 5)),
      comment: payload.comment?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    data.reviews.unshift(review);
    const customer = data.users.find((item) => item.id === user.id);
    return {
      ...review,
      customerId: review.userId,
      customerName: customer?.name || user.name || 'Velora Customer',
    };
  });
}
