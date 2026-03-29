import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import { MOCK_PRODUCTS } from '../mockData';

export type UserRole = 'customer' | 'admin' | 'vendor';
export type UserProvider = 'local' | 'google' | 'apple';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface StoreUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  provider: UserProvider;
  isVerified: boolean;
  otpCode: string | null;
  otpExpiresAt: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  categoryId: number;
  brand: string;
  images: string[];
  vendorId: number;
  stock: number;
  specifications: Record<string, string>;
  discount: number;
  freeShipping: boolean;
  colors: string[];
  sizes: string[];
  tags: string[];
  status: 'active' | 'draft';
  badge: string | null;
  featured: boolean;
  variants?: {
    colors?: string[];
    storage?: string[];
    connectivity?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreCartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedStorage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreWishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export interface StoreReview {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StoreOrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedStorage?: string;
  vendorId: number;
}

export interface StoreOrder {
  id: number;
  userId: number;
  items: StoreOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
  };
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreData {
  meta: {
    nextUserId: number;
    nextCategoryId: number;
    nextProductId: number;
    nextCartItemId: number;
    nextWishlistId: number;
    nextReviewId: number;
    nextOrderId: number;
  };
  users: StoreUser[];
  categories: StoreCategory[];
  products: StoreProduct[];
  cartItems: StoreCartItem[];
  wishlistItems: StoreWishlistItem[];
  reviews: StoreReview[];
  orders: StoreOrder[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const storePath = path.join(dataDir, 'store.json');

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createCategorySeed(now: string): StoreCategory[] {
  return [
    {
      id: 1,
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
      description: 'Core consumer electronics and everyday smart devices.',
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      name: 'Mobiles',
      slug: 'mobiles',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
      description: 'Flagship smartphones and accessories.',
      parentId: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      name: 'Computers',
      slug: 'computers',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop',
      description: 'Laptops, desktops, and creator workstations.',
      parentId: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 4,
      name: 'Gaming',
      slug: 'gaming',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
      description: 'Gaming gear, displays, and immersive experiences.',
      parentId: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 5,
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1200&auto=format&fit=crop',
      description: 'Headphones, keyboards, storage, and daily essentials.',
      parentId: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 6,
      name: 'Smart Home',
      slug: 'smart-home',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop',
      description: 'Connected home products and automation tech.',
      parentId: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 7,
      name: 'Wearables',
      slug: 'wearables',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop',
      description: 'Smart watches and health-focused wearables.',
      parentId: 1,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createInitialStore(): StoreData {
  const now = new Date().toISOString();
  const categories = createCategorySeed(now);
  const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), category]));

  const users: StoreUser[] = [
    {
      id: 1,
      name: 'Velora Admin',
      email: 'admin@velora.local',
      passwordHash: bcrypt.hashSync('Admin123!', 10),
      role: 'admin',
      provider: 'local',
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      avatar: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      name: 'Velora Vendor',
      email: 'vendor@velora.local',
      passwordHash: bcrypt.hashSync('Vendor123!', 10),
      role: 'vendor',
      provider: 'local',
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      avatar: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      name: 'Velora Customer',
      email: 'customer@velora.local',
      passwordHash: bcrypt.hashSync('Customer123!', 10),
      role: 'customer',
      provider: 'local',
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
      avatar: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const products: StoreProduct[] = MOCK_PRODUCTS.map((product, index) => {
    const matchedCategory = categoryMap.get(product.category.toLowerCase()) || categories[0];
    const colors = product.variants?.colors || [];
    const sizes = product.variants?.storage || [];

    return {
      id: index + 1,
      name: product.name,
      slug: slugify(product.name),
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: matchedCategory.name,
      categoryId: matchedCategory.id,
      brand: product.brand,
      images: product.images,
      vendorId: 2,
      stock: product.stock,
      specifications: Object.fromEntries(
        Object.entries(product.specifications ?? {}).map(([key, value]) => [key, String(value)])
      ),
      discount: product.discount,
      freeShipping: Boolean(product.freeShipping),
      colors,
      sizes,
      tags: [matchedCategory.slug, product.brand.toLowerCase(), product.freeShipping ? 'free-shipping' : 'premium'],
      status: 'active',
      badge: product.discount > 0 ? 'sale' : index < 4 ? 'new' : null,
      featured: index < 4,
      variants: product.variants,
      createdAt: product.createdAt,
      updatedAt: product.createdAt,
    };
  });

  const reviews: StoreReview[] = [
    {
      id: 1,
      userId: 3,
      productId: 1,
      rating: 5,
      comment: 'Excellent build quality and very fast performance.',
      createdAt: now,
    },
    {
      id: 2,
      userId: 3,
      productId: 3,
      rating: 4,
      comment: 'Great sound and battery life for everyday use.',
      createdAt: now,
    },
  ];

  const orders: StoreOrder[] = [
    {
      id: 1,
      userId: 3,
      items: [
        {
          productId: products[0].id,
          name: products[0].name,
          price: products[0].price,
          quantity: 1,
          image: products[0].images[0],
          brand: products[0].brand,
          vendorId: products[0].vendorId,
        },
      ],
      totalAmount: products[0].price,
      status: 'processing',
      paymentMethod: 'Cash on delivery',
      shippingAddress: {
        street: '123 Tech Avenue',
        city: 'Cairo',
        country: 'Egypt',
      },
      carrier: 'Velora Express',
      trackingNumber: 'VEL-100001',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    meta: {
      nextUserId: 4,
      nextCategoryId: categories.length + 1,
      nextProductId: products.length + 1,
      nextCartItemId: 1,
      nextWishlistId: 1,
      nextReviewId: reviews.length + 1,
      nextOrderId: orders.length + 1,
    },
    users,
    categories,
    products,
    cartItems: [],
    wishlistItems: [],
    reviews,
    orders,
  };
}

function normalizeStore(raw: Partial<StoreData> | undefined): StoreData {
  const seed = createInitialStore();
  const input = raw || {};
  const now = new Date().toISOString();

  const categories =
    input.categories?.length
      ? input.categories.map((category, index) => ({
          id: Number(category.id ?? index + 1),
          name: category.name,
          slug: category.slug || slugify(category.name),
          image: category.image || seed.categories.find((item) => item.name === category.name)?.image || seed.categories[0].image,
          description: category.description || `${category.name} products and collections.`,
          parentId: category.parentId ?? null,
          createdAt: category.createdAt || now,
          updatedAt: category.updatedAt || category.createdAt || now,
        }))
      : seed.categories;

  const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), category]));

  const users =
    input.users?.map((user, index) => ({
      id: Number(user.id ?? index + 1),
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      role: (user.role || 'customer') as UserRole,
      provider: (user.provider || 'local') as UserProvider,
      isVerified: user.isVerified ?? true,
      otpCode: user.otpCode ?? null,
      otpExpiresAt: user.otpExpiresAt ?? null,
      avatar: user.avatar ?? null,
      createdAt: user.createdAt || now,
      updatedAt: user.updatedAt || user.createdAt || now,
    })) || seed.users;

  const existingProducts =
    input.products?.map((product, index) => {
      const matchedCategory =
        categories.find((category) => category.id === Number(product.categoryId)) ||
        categoryMap.get(String(product.category || '').toLowerCase()) ||
        seed.categories[0];

      return {
        id: Number(product.id ?? index + 1),
        name: product.name,
        slug: product.slug || slugify(product.name),
        description: product.description || '',
        price: Number(product.price ?? 0),
        currency: product.currency || 'EGP',
        category: matchedCategory.name,
        categoryId: matchedCategory.id,
        brand: product.brand || 'Velora',
        images: product.images?.length ? product.images : ['https://picsum.photos/seed/velora-product/900/900'],
        vendorId: Number(product.vendorId ?? 2),
        stock: Number(product.stock ?? 0),
        specifications: Object.fromEntries(
          Object.entries(product.specifications || {}).map(([key, value]) => [key, String(value)])
        ),
        discount: Number(product.discount ?? 0),
        freeShipping: Boolean(product.freeShipping),
        colors: product.colors || product.variants?.colors || [],
        sizes: product.sizes || product.variants?.storage || [],
        tags: product.tags || [matchedCategory.slug, String(product.brand || 'velora').toLowerCase()],
        status: product.status || 'active',
        badge: product.badge ?? null,
        featured: product.featured ?? index < 4,
        variants: {
          colors: product.variants?.colors || product.colors || [],
          storage: product.variants?.storage || product.sizes || [],
          connectivity: product.variants?.connectivity || [],
        },
        createdAt: product.createdAt || now,
        updatedAt: product.updatedAt || product.createdAt || now,
      };
    }) || seed.products;

  const existingMaxProductId = Math.max(0, ...existingProducts.map((product) => product.id));
  const missingSeedProducts = seed.products
    .filter((seedProduct) => !existingProducts.some((product) => product.slug === seedProduct.slug))
    .map((seedProduct, index) => ({
      ...seedProduct,
      id: existingMaxProductId + index + 1,
    }));

  const products = [...existingProducts, ...missingSeedProducts];
  const maxProductId = Math.max(0, ...products.map((product) => product.id));

  const orders =
    input.orders?.map((order, index) => ({
      id: Number(order.id ?? index + 1),
      userId: Number(order.userId),
      items: (order.items || []).map((item) => ({
        ...item,
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: Number(item.price),
        vendorId: Number(item.vendorId ?? 2),
      })),
      totalAmount: Number(order.totalAmount ?? 0),
      status: (order.status || 'pending') as OrderStatus,
      paymentMethod: order.paymentMethod || 'Cash on delivery',
      shippingAddress: {
        street: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        country: order.shippingAddress?.country || '',
      },
      carrier: order.carrier || 'Velora Express',
      trackingNumber: order.trackingNumber || `VEL-${String(index + 100001)}`,
      estimatedDelivery: order.estimatedDelivery || now,
      createdAt: order.createdAt || now,
      updatedAt: order.updatedAt || order.createdAt || now,
    })) || seed.orders;

  const normalized: StoreData = {
    meta: {
      nextUserId: Number(input.meta?.nextUserId ?? users.length + 1),
      nextCategoryId: Number(input.meta?.nextCategoryId ?? categories.length + 1),
      nextProductId: Math.max(Number(input.meta?.nextProductId ?? maxProductId + 1), maxProductId + 1),
      nextCartItemId: Number(input.meta?.nextCartItemId ?? 1),
      nextWishlistId: Number(input.meta?.nextWishlistId ?? 1),
      nextReviewId: Number(input.meta?.nextReviewId ?? 1),
      nextOrderId: Number(input.meta?.nextOrderId ?? orders.length + 1),
    },
    users,
    categories,
    products,
    cartItems:
      input.cartItems?.map((item, index) => ({
        id: Number(item.id ?? index + 1),
        userId: Number(item.userId),
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        selectedStorage: item.selectedStorage,
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || item.createdAt || now,
      })) || [],
    wishlistItems:
      input.wishlistItems?.map((item, index) => ({
        id: Number(item.id ?? index + 1),
        userId: Number(item.userId),
        productId: Number(item.productId),
        createdAt: item.createdAt || now,
      })) || [],
    reviews:
      input.reviews?.map((review, index) => ({
        id: Number(review.id ?? index + 1),
        userId: Number(review.userId),
        productId: Number(review.productId),
        rating: Number(review.rating),
        comment: review.comment || '',
        createdAt: review.createdAt || now,
      })) || seed.reviews,
    orders,
  };

  return normalized;
}

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(createInitialStore(), null, 2), 'utf8');
    return;
  }

  const raw = fs.readFileSync(storePath, 'utf8');
  const normalized = normalizeStore(JSON.parse(raw) as Partial<StoreData>);
  fs.writeFileSync(storePath, JSON.stringify(normalized, null, 2), 'utf8');
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function readStore(): StoreData {
  ensureStore();
  const raw = fs.readFileSync(storePath, 'utf8');
  return normalizeStore(JSON.parse(raw) as Partial<StoreData>);
}

export function writeStore(data: StoreData) {
  ensureStore();
  fs.writeFileSync(storePath, JSON.stringify(normalizeStore(data), null, 2), 'utf8');
}

export function mutateStore<T>(mutator: (data: StoreData) => T): T {
  const data = readStore();
  const result = mutator(data);
  writeStore(data);
  return clone(result);
}

export function takeNextId(data: StoreData, key: keyof StoreData['meta']) {
  const id = data.meta[key];
  data.meta[key] += 1;
  return id;
}

export function sanitizeUser(user: StoreUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    isVerified: user.isVerified,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export { slugify };
