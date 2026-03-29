import { mutateStore, readStore, takeNextId } from '../data/store';

function mapCartItem(
  item: {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    selectedStorage?: string;
    createdAt: string;
    updatedAt: string;
  },
  data = readStore()
) {
  const product = data.products.find((entry) => entry.id === item.productId);
  if (!product) {
    return null;
  }

  return {
    ...item,
    product,
  };
}

export async function getCart(userId: number) {
  const data = readStore();

  return data.cartItems
    .filter((item) => item.userId === userId)
    .map((item) => mapCartItem(item, data))
    .filter(Boolean);
}

export async function addToCart(
  userId: number,
  productId: number,
  quantity = 1,
  options?: { selectedColor?: string; selectedSize?: string; selectedStorage?: string }
) {
  return mutateStore((data) => {
    const product = data.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existing = data.cartItems.find(
      (item) =>
        item.userId === userId &&
        item.productId === productId &&
        item.selectedColor === options?.selectedColor &&
        item.selectedSize === options?.selectedSize &&
        item.selectedStorage === options?.selectedStorage
    );

    if (existing) {
      existing.quantity += Math.max(1, quantity);
      existing.updatedAt = new Date().toISOString();
      return mapCartItem(existing, data);
    }

    const cartItem = {
      id: takeNextId(data, 'nextCartItemId'),
      userId,
      productId,
      quantity: Math.max(1, quantity),
      selectedColor: options?.selectedColor,
      selectedSize: options?.selectedSize,
      selectedStorage: options?.selectedStorage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.cartItems.push(cartItem);
    return mapCartItem(cartItem, data);
  });
}

export async function updateCartItem(cartItemId: number, userId: number, quantity: number) {
  return mutateStore((data) => {
    const cartItem = data.cartItems.find((item) => item.id === cartItemId && item.userId === userId);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    cartItem.quantity = Math.max(1, quantity);
    cartItem.updatedAt = new Date().toISOString();
    return mapCartItem(cartItem, data);
  });
}

export async function removeFromCart(cartItemId: number, userId: number) {
  return mutateStore((data) => {
    data.cartItems = data.cartItems.filter((item) => !(item.id === cartItemId && item.userId === userId));
    return true;
  });
}

export async function clearCart(userId: number) {
  return mutateStore((data) => {
    data.cartItems = data.cartItems.filter((item) => item.userId !== userId);
    return true;
  });
}
