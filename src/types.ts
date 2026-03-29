export type UserRole = 'customer' | 'admin' | 'vendor';
export type UserProvider = 'local' | 'google' | 'apple';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  provider: UserProvider;
  isVerified: boolean;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  parentId: number | null;
  productsCount?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  categoryId: number;
  categoryInfo?: Category | null;
  brand: string;
  images: string[];
  vendorId: number;
  stock: number;
  specifications: Record<string, string>;
  rating: number;
  reviewCount: number;
  discount: number;
  colors: string[];
  sizes: string[];
  tags: string[];
  status: 'active' | 'draft';
  badge?: string | null;
  featured: boolean;
  freeShipping?: boolean;
  inStock?: boolean;
  variants?: {
    colors?: string[];
    storage?: string[];
    connectivity?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: number;
  productId: number;
  customerId: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedStorage?: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface WishlistItem {
  id: number;
  productId: number;
  createdAt: string;
  product: Product;
}

export interface OrderItem {
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

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
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

export interface RegisterResponse {
  requiresOtp: boolean;
  message: string;
  user: UserProfile;
  devOtp?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message?: string;
}

export interface AdminOverview {
  stats: {
    totalUsers: number;
    totalVendors: number;
    totalCustomers: number;
    totalCategories: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  users: UserProfile[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  recentOrders: Order[];
}

export interface VendorOverview {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    lowStock: number;
  };
  products: Product[];
  orders: Order[];
}
