import { readStore } from '../data/store';

export async function getVendorOverview(vendorId: number) {
  const data = readStore();
  const products = data.products.filter((product) => product.vendorId === vendorId);
  const orders = data.orders
    .filter((order) => order.items.some((item) => item.vendorId === vendorId))
    .map((order) => ({
      ...order,
      items: order.items.filter((item) => item.vendorId === vendorId),
    }));

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemsTotal, item) => itemsTotal + item.price * item.quantity, 0),
    0
  );

  return {
    stats: {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      lowStock: products.filter((product) => product.stock < 10).length,
    },
    products,
    orders,
  };
}
