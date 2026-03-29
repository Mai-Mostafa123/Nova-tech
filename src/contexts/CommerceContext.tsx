import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { CartItem, WishlistItem } from '../types';
import { storefrontApi } from '../services/storefrontApi';
import { useAuth } from './AuthContext';

interface CommerceContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  loading: boolean;
  cartCount: number;
  wishlistCount: number;
  refreshCommerce: () => Promise<void>;
  addToCart: (productId: number, quantity?: number, options?: { selectedColor?: string; selectedSize?: string; selectedStorage?: string }) => Promise<void>;
  updateCartQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isWishlisted: (productId: number) => boolean;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCommerce = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    try {
      const [cart, wishlist] = await Promise.all([storefrontApi.getCart(), storefrontApi.getWishlist()]);
      setCartItems(cart);
      setWishlistItems(wishlist);
    } catch (error) {
      console.error('Failed to load commerce data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCommerce();
  }, [user?.id, isAuthenticated]);

  const addToCart = async (
    productId: number,
    quantity = 1,
    options?: { selectedColor?: string; selectedSize?: string; selectedStorage?: string }
  ) => {
    await storefrontApi.addToCart(productId, quantity, options);
    await refreshCommerce();
    toast.success('Added to cart');
  };

  const updateCartQuantity = async (itemId: number, quantity: number) => {
    await storefrontApi.updateCartItem(itemId, quantity);
    await refreshCommerce();
  };

  const removeFromCart = async (itemId: number) => {
    await storefrontApi.removeCartItem(itemId);
    await refreshCommerce();
    toast.success('Removed from cart');
  };

  const toggleWishlist = async (productId: number) => {
    const exists = wishlistItems.some((item) => item.productId === productId);
    if (exists) {
      await storefrontApi.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } else {
      await storefrontApi.addToWishlist(productId);
      toast.success('Added to wishlist');
    }

    await refreshCommerce();
    return !exists;
  };

  const value: CommerceContextType = {
    cartItems,
    wishlistItems,
    loading,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlistItems.length,
    refreshCommerce,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    isWishlisted: (productId) => wishlistItems.some((item) => item.productId === productId),
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used inside CommerceProvider');
  }

  return context;
}
