import { mutateStore, readStore, takeNextId } from '../data/store';

function mapWishlistItem(item: { id: number; userId: number; productId: number; createdAt: string }, data = readStore()) {
  const product = data.products.find((entry) => entry.id === item.productId);
  if (!product) {
    return null;
  }

  return {
    ...item,
    product,
  };
}

export async function getWishlist(userId: number) {
  const data = readStore();

  return data.wishlistItems
    .filter((item) => item.userId === userId)
    .map((item) => mapWishlistItem(item, data))
    .filter(Boolean);
}

export async function addToWishlist(userId: number, productId: number) {
  return mutateStore((data) => {
    const product = data.products.find((item) => item.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existing = data.wishlistItems.find((item) => item.userId === userId && item.productId === productId);
    if (existing) {
      return mapWishlistItem(existing, data);
    }

    const wishlistItem = {
      id: takeNextId(data, 'nextWishlistId'),
      userId,
      productId,
      createdAt: new Date().toISOString(),
    };

    data.wishlistItems.push(wishlistItem);
    return mapWishlistItem(wishlistItem, data);
  });
}

export async function removeFromWishlist(userId: number, productId: number) {
  return mutateStore((data) => {
    data.wishlistItems = data.wishlistItems.filter((item) => !(item.userId === userId && item.productId === productId));
    return true;
  });
}
