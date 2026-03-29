import type { Product } from '../types';

const STORAGE_KEY = 'velora-recent-products';

function readIds() {
  if (typeof window === 'undefined') {
    return [] as number[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function trackProductView(productId: number) {
  if (typeof window === 'undefined') {
    return;
  }

  const next = [productId, ...readIds().filter((id) => id !== productId)].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getRecentProductIds() {
  return readIds();
}

export function getRecentProducts(products: Product[]) {
  const recentIds = readIds();
  return recentIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
}
