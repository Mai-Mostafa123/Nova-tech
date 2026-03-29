import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Package, TrendingUp, DollarSign, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import ProductForm from '../components/ProductForm';
import { storefrontApi } from '../services/storefrontApi';
import type { Product, VendorOverview } from '../types';

export default function VendorDashboard() {
  const [overview, setOverview] = useState<VendorOverview | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const data = await storefrontApi.getVendorOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load vendor overview', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'vendor' && user.role !== 'admin') {
      navigate('/profile');
      return;
    }

    void loadOverview();
  }, [loading, navigate, user]);

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    try {
      await storefrontApi.deleteProduct(productId);
      toast.success('Product deleted');
      await loadOverview();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const stats = overview
    ? [
        { label: 'Total Revenue', value: overview.stats.totalRevenue, icon: DollarSign, type: 'currency' as const },
        { label: 'Active Products', value: overview.stats.totalProducts, icon: Package, type: 'count' as const },
        { label: 'Total Orders', value: overview.stats.totalOrders, icon: TrendingUp, type: 'count' as const },
        { label: 'Low Stock', value: overview.stats.lowStock, icon: AlertCircle, type: 'count' as const },
      ]
    : [];

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Vendor <span className="italic text-white/40">Portal</span>
            </h1>
            <p className="mt-2 text-sm text-white/40">Manage your products and watch your sales from one backend-connected dashboard.</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" /> Add New Product
          </button>
        </div>

        <AnimatePresence>
          {showProductForm && (
            <ProductForm
              product={editingProduct}
              onClose={() => setShowProductForm(false)}
              onSuccess={() => {
                void loadOverview();
              }}
            />
          )}
        </AnimatePresence>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-white/5 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-white/5 p-3">
                  <stat.icon className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stat.type === 'currency' ? formatPrice(stat.value) : stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 lg:col-span-3">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <LayoutDashboard className="h-5 w-5 text-emerald-500" /> Products
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">{overview?.products.length || 0} items</span>
            </div>
            <div className="space-y-4">
              {overview?.products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <img src={product.images[0]} className="h-16 w-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{product.name}</p>
                    <p className="mt-1 text-xs text-white/40">{product.category}</p>
                    <p className={cn('mt-2 text-[10px] font-bold uppercase tracking-widest', product.stock < 10 ? 'text-amber-500' : 'text-emerald-500')}>
                      {product.stock} in stock
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => void handleDeleteProduct(product.id)} className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent Orders</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Live</span>
            </div>
            <div className="space-y-4">
              {overview?.orders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Order #{String(order.id).padStart(6, '0')}</p>
                      <p className="mt-1 text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">
                        {formatPrice(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
              {overview?.orders.length === 0 && <p className="text-sm text-white/40">No orders yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
