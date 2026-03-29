import { clearCart, getCart } from './cartService';
import { mutateStore, readStore, takeNextId, type OrderStatus } from '../data/store';

export async function createOrder(
  userId: number,
  paymentMethod: string,
  shippingAddress: { street: string; city: string; country: string }
) {
  const cartItems = await getCart(userId);
  if (cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const order = mutateStore((data) => {
    const orderRecord = {
      id: takeNextId(data, 'nextOrderId'),
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0],
        brand: item.product.brand,
        vendorId: item.product.vendorId,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        selectedStorage: item.selectedStorage,
      })),
      totalAmount,
      status: 'pending' as const,
      paymentMethod: paymentMethod || 'Cash on delivery',
      shippingAddress,
      carrier: 'Velora Express',
      trackingNumber: `VEL-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.orders.unshift(orderRecord);

    for (const item of cartItems) {
      const product = data.products.find((entry) => entry.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.updatedAt = new Date().toISOString();
      }
    }

    return orderRecord;
  });

  await clearCart(userId);
  return order;
}

export async function getOrders(userId: number) {
  const data = readStore();
  return data.orders.filter((order) => order.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllOrders() {
  const data = readStore();

  return data.orders
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((order) => {
      const user = data.users.find((item) => item.id === order.userId);
      return {
        ...order,
        customer: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
      };
    });
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  return mutateStore((data) => {
    const order = data.orders.find((item) => item.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  });
}

export async function getVendorOrders(vendorId: number) {
  const data = readStore();

  return data.orders
    .filter((order) => order.items.some((item) => item.vendorId === vendorId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((order) => ({
      ...order,
      items: order.items.filter((item) => item.vendorId === vendorId),
    }));
}
