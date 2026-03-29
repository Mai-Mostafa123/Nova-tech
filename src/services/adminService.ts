import { mutateStore, readStore, sanitizeUser } from '../data/store';

export async function getAdminOverview() {
  const data = readStore();
  const totalRevenue = data.orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    stats: {
      totalUsers: data.users.length,
      totalVendors: data.users.filter((user) => user.role === 'vendor').length,
      totalCustomers: data.users.filter((user) => user.role === 'customer').length,
      totalCategories: data.categories.length,
      totalProducts: data.products.length,
      totalOrders: data.orders.length,
      totalRevenue,
    },
    users: data.users.map(sanitizeUser),
    categories: data.categories,
    products: data.products,
    orders: data.orders,
    recentOrders: data.orders.slice(0, 8),
  };
}

export async function updateAdminUser(userId: number, payload: { role?: 'customer' | 'admin'; isVerified?: boolean }) {
  return mutateStore((data) => {
    const user = data.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (payload.role) {
      user.role = payload.role;
    }

    if (payload.isVerified !== undefined) {
      user.isVerified = payload.isVerified;
    }

    user.updatedAt = new Date().toISOString();
    return sanitizeUser(user);
  });
}
