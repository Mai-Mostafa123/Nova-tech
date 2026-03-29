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
    if (loading) return;
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

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await storefrontApi.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      await loadOverview();
    } catch (error) {
      toast.error('Could not update order status');
    }
  };

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">Velora Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white/20 transition-all"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
                    >
                      <div className="p-4">
                        <h3 className="font-semibold mb-3">Notifications</h3>
                        <div className="space-y-2">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'success' ? 'bg-green-500' :
                                notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm">{notif.message}</p>
                                <p className="text-xs text-gray-400">{notif.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 min-h-screen"
        >
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                  activeTab === tab.id 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "hover:bg-white/10 text-gray-300"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="w-1 h-6 bg-emerald-500 rounded-full ml-auto"
                  />
                )}
              </button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <p className="text-3xl font-bold mt-2">{stat.value.toLocaleString()}</p>
                            <div className="flex items-center mt-2 space-x-1">
                              {stat.trend === 'up' ? (
                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm ${
                                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {stat.change}
                              </span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg bg-black/30`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                      <div className="space-y-3">
                        {overview?.orders?.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-gray-400">{order.customerEmail}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(order.total)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                      <div className="space-y-3">
                        {overview?.products?.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-400">{product.stock} in stock</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(product.price)}</p>
                              <p className="text-sm text-gray-400">{product.sales || 0} sold</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Analytics & Reports</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <BarChart3 className="w-16 h-16" />
                        <p className="ml-3">Chart visualization coming soon</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">User Activity</h3>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <Activity className="w-16 h-16" />
                        <p className="ml-3">Activity tracking coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Users Management</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
                      <UserPlus className="w-4 h-4" />
                      <span>Add User</span>
                    </button>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/30 border-b border-white/20">
                          <tr>
                            <th className="text-left p-4">User</th>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Joined</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overview?.users?.map((user) => (
                            <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{user.name[0]}</span>
                                  </div>
                                  <span>{user.name}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                  user.role === 'vendor' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-4">{user.email}</td>
                              <td className="p-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Products Management</h2>
                    <button 
                      onClick={() => setShowProductForm(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/30 border-b border-white/20">
                          <tr>
                            <th className="text-left p-4">Product</th>
                            <th className="text-left p-4">Category</th>
                            <th className="text-left p-4">Price</th>
                            <th className="text-left p-4">Stock</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-gray-400">{product.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">{product.category}</td>
                              <td className="p-4">{formatPrice(product.price)}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  product.stock > 10 ? 'bg-green-500/20 text-green-400' :
                                  product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {product.stock} units
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Categories Management</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Category Form */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Category Name</label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="Enter category name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Slug (Optional)</label>
                          <input
                            type="text"
                            value={categoryForm.slug}
                            onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="category-slug"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                            rows={3}
                            placeholder="Category description"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Add Category</span>
                        </button>
                      </form>
                    </div>

                    {/* Categories List */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
                      <div className="space-y-3">
                        {overview?.categories?.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                            <div className="flex items-center space-x-3">
                              <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-sm text-gray-400">{category.slug}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Orders Management</h2>
                    <div className="flex items-center space-x-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                        className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="all">All Status</option>
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/30 border-b border-white/20">
                          <tr>
                            <th className="text-left p-4">Order ID</th>
                            <th className="text-left p-4">Customer</th>
                            <th className="text-left p-4">Total</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium">#{order.id}</td>
                              <td className="p-4">{order.customerEmail}</td>
                              <td className="p-4">{formatPrice(order.total)}</td>
                              <td className="p-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className={`px-2 py-1 rounded-full text-xs border-0 focus:outline-none ${
                                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                    order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                    order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                                    order.status === 'delivered' ? 'bg-cyan-500/20 text-cyan-400' :
                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {ORDER_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-400">Receive email alerts</p>
                          </div>
                          <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-400">Toggle dark theme</p>
                          </div>
                          <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Security</h3>
                      <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <span>Two-Factor Authentication</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Settings className="w-5 h-5 text-blue-500" />
                            <span>API Keys</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSubmit={async (productData) => {
                    try {
                      if (editingProduct) {
                        await storefrontApi.updateProduct(editingProduct.id, productData);
                        toast.success('Product updated successfully');
                      } else {
                        await storefrontApi.createProduct(productData);
                        toast.success('Product created successfully');
                      }
                      setShowProductForm(false);
                      setEditingProduct(null);
                      await loadOverview();
                    } catch (error) {
                      toast.error('Failed to save product');
                    }
                  }}
                  onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
