import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, Store, Package, DollarSign, ShieldCheck, Layers3, Save, CheckCircle2,
  Search, Filter, Plus, Edit2, Trash2, Eye, TrendingUp, ShoppingCart,
  UserPlus, UserMinus, Settings, LogOut, Bell, BarChart3, PieChart,
  Activity, ArrowUpRight, ArrowDownRight, Download, Upload, RefreshCw,
  Star, Clock, Calendar, MapPin, Phone, Mail, Globe, CreditCard,
  AlertTriangle, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { storefrontApi } from '../services/storefrontApi';
import ProductForm from '../components/ProductForm';
import type { AdminOverview, Category, Product, OrderStatus } from '../types';

type AdminTab = 'overview' | 'categories' | 'products' | 'orders' | 'users' | 'analytics' | 'settings';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: '',
    description: '',
    parentId: '',
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order received', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Product out of stock', time: '1 hour ago', type: 'warning' },
    { id: 3, message: 'New user registered', time: '3 hours ago', type: 'success' },
  ]);
  const { formatPrice } = useCurrency();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const data = await storefrontApi.getAdminOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load admin overview', error);
      toast.error('Failed to load dashboard data');
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

    if (user.role !== 'admin') {
      navigate('/profile');
      return;
    }

    void loadOverview();
  }, [loading, navigate, user]);

  const stats = useMemo(
    () =>
      overview
        ? [
            { label: 'Total Users', value: overview.stats.totalUsers, icon: Users, color: 'text-blue-500', change: '+12%', trend: 'up' },
            { label: 'Categories', value: overview.stats.totalCategories, icon: Layers3, color: 'text-cyan-400', change: '+5%', trend: 'up' },
            { label: 'Products', value: overview.stats.totalProducts, icon: Package, color: 'text-emerald-500', change: '+18%', trend: 'up' },
            { label: 'Revenue', value: overview.stats.totalRevenue, icon: DollarSign, color: 'text-amber-500', change: '+23%', trend: 'up' },
            { label: 'Orders', value: overview.stats.totalOrders || 0, icon: ShoppingCart, color: 'text-purple-500', change: '+8%', trend: 'up' },
            { label: 'Active Vendors', value: overview.stats.activeVendors || 0, icon: Store, color: 'text-pink-500', change: '+15%', trend: 'up' },
          ]
        : [],
    [overview]
  );

  const filteredProducts = useMemo(() => {
    if (!overview?.products) return [];
    return overview.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [overview, searchTerm]);

  const filteredOrders = useMemo(() => {
    if (!overview?.orders) return [];
    return overview.orders.filter(order => 
      (filterStatus === 'all' || order.status === filterStatus) &&
      (order.id.toString().includes(searchTerm) || order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [overview, searchTerm, filterStatus]);

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await storefrontApi.deleteUser(userId);
      toast.success('User deleted successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not delete user');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await storefrontApi.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not update order status');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await storefrontApi.createCategory({
        name: categoryForm.name,
        slug: categoryForm.slug || undefined,
        image: categoryForm.image || undefined,
        description: categoryForm.description,
        parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
      });
      setCategoryForm({ name: '', slug: '', image: '', description: '', parentId: '' });
      toast.success('Category added successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not add category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await storefrontApi.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not delete category');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await storefrontApi.deleteProduct(productId);
      toast.success('Product deleted successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not delete product');
    }
  };

  const handleOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await storefrontApi.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not update order status');
    }
  };

  const handleUserUpdate = async (userId: number, payload: { role?: 'customer' | 'admin'; isVerified?: boolean }) => {
    try {
      await storefrontApi.updateAdminUser(userId, payload);
      toast.success('User updated');
      await loadOverview();
    } catch (error) {
      toast.error('Could not update user');
    }
  };

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
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white">
            Admin <span className="italic text-white/40">Commerce Center</span>
          </h1>
          <p className="mt-2 text-sm text-white/40">Manage categories, products, orders, and users from one dashboard.</p>
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
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {stat.label === 'Revenue' ? formatPrice(stat.value) : stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: ShieldCheck },
            { id: 'categories', label: 'Categories', icon: Layers3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: Store },
            { id: 'users', label: 'Users', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={cn(
                'flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all',
                activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 lg:col-span-3">
              <h2 className="mb-6 text-lg font-bold text-white">Quick Health</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-sm font-bold text-white">Customers</p>
                  <p className="mt-2 text-3xl font-black text-emerald-500">{overview?.stats.totalCustomers || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-sm font-bold text-white">Admins</p>
                  <p className="mt-2 text-3xl font-black text-cyan-400">{overview?.users.filter((item) => item.role === 'admin').length || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-sm font-bold text-white">Pending Orders</p>
                  <p className="mt-2 text-3xl font-black text-amber-400">{overview?.orders.filter((item) => item.status === 'pending').length || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-sm font-bold text-white">Featured Products</p>
                  <p className="mt-2 text-3xl font-black text-white">{overview?.products.filter((item) => item.featured).length || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8 lg:col-span-2">
              <h2 className="mb-6 text-lg font-bold text-white">Recent Orders</h2>
              <div className="space-y-4">
                {overview?.recentOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Order #{String(order.id).padStart(6, '0')}</p>
                        <p className="mt-1 text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">{formatPrice(order.totalAmount)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <form onSubmit={handleCategorySubmit} className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-8">
              <h2 className="text-lg font-bold text-white">Add Category</h2>
              <input value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Category name" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" required />
              <input value={categoryForm.slug} onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="Slug (optional)" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
              <input value={categoryForm.image} onChange={(event) => setCategoryForm((prev) => ({ ...prev, image: event.target.value }))} placeholder="Image URL" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
              <textarea value={categoryForm.description} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
              <select value={categoryForm.parentId} onChange={(event) => setCategoryForm((prev) => ({ ...prev, parentId: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none">
                <option value="">No parent</option>
                {overview?.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400">
                <Save className="h-4 w-4" /> Save Category
              </button>
            </form>

            <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-8">
              <h2 className="text-lg font-bold text-white">Categories</h2>
              {overview?.categories.map((category) => (
                <div key={category.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <img src={category.image} className="h-16 w-16 rounded-2xl object-cover" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{category.name}</p>
                    <p className="mt-1 text-xs text-white/40">{category.description}</p>
                  </div>
                  <button onClick={() => void handleDeleteCategory(category.id)} className="rounded-full border border-red-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Products</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400"
              >
                Add Product
              </button>
            </div>
            {overview?.products.map((product) => (
              <div key={product.id} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 md:flex-row md:items-center">
                <img src={product.images[0]} className="h-20 w-20 rounded-2xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-white/40">{product.category} • {product.brand}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-emerald-500">{product.stock} in stock</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowProductForm(true);
                    }}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button onClick={() => void handleDeleteProduct(product.id)} className="rounded-full border border-red-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-8">
            <h2 className="text-lg font-bold text-white">Orders</h2>
            {overview?.orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 xl:flex-row xl:items-center">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Order #{String(order.id).padStart(6, '0')}</p>
                  <p className="mt-1 text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm font-bold text-emerald-500">{formatPrice(order.totalAmount)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => void handleOrderStatus(order.id, status)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all',
                        order.status === status ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-8">
            <h2 className="text-lg font-bold text-white">Users</h2>
            {overview?.users.map((account) => (
              <div key={account.id} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 xl:flex-row xl:items-center">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{account.name}</p>
                  <p className="mt-1 text-xs text-white/40">{account.email}</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
                    {account.provider} <CheckCircle2 className={cn('h-3 w-3', account.isVerified ? 'text-emerald-400' : 'text-white/20')} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void handleUserUpdate(account.id, { role: account.role === 'admin' ? 'customer' : 'admin' })}
                    className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
                  >
                    Make {account.role === 'admin' ? 'Customer' : 'Admin'}
                  </button>
                  <button
                    onClick={() => void handleUserUpdate(account.id, { isVerified: !account.isVerified })}
                    className={cn(
                      'rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all',
                      account.isVerified ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' : 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                    )}
                  >
                    {account.isVerified ? 'Verified' : 'Unverified'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
