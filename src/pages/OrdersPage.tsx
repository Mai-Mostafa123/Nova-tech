import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, CreditCard, MapPin, Package, RotateCcw, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { cn } from '../lib/utils';
import { storefrontApi } from '../services/storefrontApi';
import type { Order } from '../types';

type OrderFilter = 'all' | 'active' | 'completed';

export default function OrdersPage() {
  usePageTitle('Orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCommerce();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    storefrontApi
      .getMyOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load orders', error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  const filteredOrders = useMemo(() => {
    if (filter === 'active') {
      return orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status));
    }
    if (filter === 'completed') {
      return orders.filter((order) => ['delivered', 'completed'].includes(order.status));
    }
    return orders;
  }, [filter, orders]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      active: orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status)).length,
      spent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    }),
    [orders]
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'processing':
        return 'text-blue-500 bg-blue-500/10';
      case 'shipped':
        return 'text-indigo-500 bg-indigo-500/10';
      case 'delivered':
      case 'completed':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-white/40 bg-white/5';
    }
  };

  const reorder = async (order: Order) => {
    for (const item of order.items) {
      await addToCart(item.productId, item.quantity, {
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize || item.selectedStorage,
      });
    }
    toast.success('Order items added back to cart');
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Package className="mb-6 h-16 w-16 text-white/10" />
        <h2 className="mb-4 text-2xl font-bold text-white">{t('orders.login')}</h2>
        <button onClick={() => navigate('/login')} className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400">
          {t('auth.login')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t('orders.title').split(' ')[0]} <span className="italic text-white/40">{t('orders.title').split(' ')[1]}</span>
          </h1>
          <p className="mt-3 text-sm text-white/50">Track progress, inspect payment/shipping details, and reorder your favorite setups in one place.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Orders</p>
            <p className="mt-2 text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Active</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{stats.active}</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Total spent</p>
            <p className="mt-2 text-2xl font-black text-white">{formatPrice(stats.spent)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'completed', label: 'Completed' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as OrderFilter)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all',
              filter === item.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/55 hover:text-white'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 bg-black/10 p-6 sm:px-8">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.id')}</p>
                    <p className="text-xs font-mono text-white">#{String(order.id).padStart(6, '0')}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.date')}</p>
                    <p className="text-xs text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.total')}</p>
                    <p className="text-xs font-bold text-emerald-500">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest', getStatusColor(order.status))}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-12 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="group flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                        <div className="h-[72px] w-[72px] overflow-hidden rounded-xl border border-white/10 bg-black">
                          <img src={item.image} className="h-[72px] w-[72px] object-cover opacity-80 transition-opacity group-hover:opacity-100" alt="" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <p className="mt-1 text-xs text-white/40">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => void reorder(order)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition-all hover:bg-white/10 hover:text-white">
                      <RotateCcw className="h-4 w-4" />
                      Reorder Items
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 text-white/20" />
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.shipping')}</p>
                            <p className="text-xs leading-relaxed text-white">
                              {order.shippingAddress.street}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CreditCard className="mt-0.5 h-4 w-4 text-white/20" />
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.payment')}</p>
                            <p className="text-xs uppercase tracking-wider text-white">{order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                      <div className="mb-4 flex justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.status')}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live</span>
                      </div>
                      <div className="relative mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-1000"
                          style={{
                            width:
                              order.status === 'pending'
                                ? '12%'
                                : order.status === 'processing'
                                  ? '40%'
                                  : order.status === 'shipped'
                                    ? '75%'
                                    : order.status === 'delivered' || order.status === 'completed'
                                      ? '100%'
                                      : '0%',
                          }}
                        />
                      </div>

                      {order.status !== 'pending' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.carrier')}</span>
                            <span className="text-xs font-bold text-white">{order.carrier}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.tracking')}</span>
                            <span className="text-xs font-mono text-emerald-500">{order.trackingNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('orders.est_delivery')}</span>
                            <span className="text-xs font-bold text-white">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 py-32 text-center">
          <Package className="mb-6 h-12 w-12 text-white/10" />
          <p className="text-white/40">{t('orders.empty')}</p>
          <button onClick={() => navigate('/products')} className="mt-6 text-sm font-bold text-emerald-500 hover:underline">
            {t('nav.products')}
          </button>
        </div>
      )}
    </div>
  );
}
