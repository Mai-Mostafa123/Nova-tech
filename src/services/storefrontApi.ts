import type { AdminOverview, AuthResponse, CartItem, Category, Order, OrderStatus, Product, RegisterResponse, Review, UserProfile, VendorOverview, WishlistItem } from '../types';
import { apiRequest } from './apiClient';

export const storefrontApi = {
  register(payload: { name: string; email: string; password: string }) {
    return apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyOtp(payload: { email: string; otp: string }) {
    return apiRequest<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  resendOtp(email: string) {
    return apiRequest<RegisterResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  socialLogin(provider: 'google' | 'apple') {
    return apiRequest<AuthResponse>('/auth/social', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  },
  getMe() {
    return apiRequest<UserProfile>('/auth/me');
  },
  updateProfile(payload: { name?: string; email?: string; password?: string }) {
    return apiRequest<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  getCategories() {
    return apiRequest<Category[]>('/categories');
  },
  createCategory(payload: Partial<Category>) {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateCategory(categoryId: number, payload: Partial<Category>) {
    return apiRequest<Category>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteCategory(categoryId: number) {
    return apiRequest<{ message: string }>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
  getProducts(options?: { category?: string; search?: string; featured?: boolean }) {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);
    if (options?.featured !== undefined) params.set('featured', String(options.featured));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Product[]>(`/products${query}`);
  },
  getVendorProducts(vendorId: number) {
    return apiRequest<Product[]>(`/products?vendorId=${vendorId}`);
  },
  getProduct(productId: string | number) {
    return apiRequest<Product>(`/products/${productId}`);
  },
  getProductReviews(productId: string | number) {
    return apiRequest<Review[]>(`/products/${productId}/reviews`);
  },
  createReview(productId: string | number, payload: { rating: number; comment: string }) {
    return apiRequest<Review>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getCart() {
    return apiRequest<CartItem[]>('/cart');
  },
  addToCart(
    productId: number,
    quantity = 1,
    options?: { selectedColor?: string; selectedSize?: string; selectedStorage?: string }
  ) {
    return apiRequest<CartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        selectedColor: options?.selectedColor,
        selectedSize: options?.selectedSize,
        selectedStorage: options?.selectedStorage ?? options?.selectedSize,
      }),
    });
  },
  updateCartItem(itemId: number, quantity: number) {
    return apiRequest<CartItem>(`/cart/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },
  removeCartItem(itemId: number) {
    return apiRequest<{ message: string }>(`/cart/${itemId}`, { method: 'DELETE' });
  },
  getWishlist() {
    return apiRequest<WishlistItem[]>('/wishlist');
  },
  addToWishlist(productId: number) {
    return apiRequest<WishlistItem>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
  removeFromWishlist(productId: number) {
    return apiRequest<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE' });
  },
  getMyOrders() {
    return apiRequest<Order[]>('/orders/me');
  },
  checkout(payload: { paymentMethod: string; shippingAddress: { street: string; city: string; country: string } }) {
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getVendorOrders() {
    return apiRequest<Order[]>('/orders/vendor/me');
  },
  updateOrderStatus(orderId: number, status: OrderStatus) {
    return apiRequest<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  createProduct(payload: Partial<Product>) {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateProduct(productId: number, payload: Partial<Product>) {
    return apiRequest<Product>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteProduct(productId: number) {
    return apiRequest<{ message: string }>(`/products/${productId}`, {
      method: 'DELETE',
    });
  },
  getAdminOverview() {
    return apiRequest<AdminOverview>('/admin/overview');
  },
  updateAdminUser(userId: number, payload: { role?: 'customer' | 'admin'; isVerified?: boolean }) {
    return apiRequest<UserProfile>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getVendorOverview() {
    return apiRequest<VendorOverview>('/vendor/overview');
  },
};
