import React, { useEffect, useMemo, useState } from 'react';
import { 
  Store, Package, DollarSign, TrendingUp, ShoppingCart, Plus, Edit2, Trash2, Eye,
  Search, Filter, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  Download, Upload, RefreshCw, Star, Clock, Calendar, MapPin, Phone,
  Mail, Globe, CreditCard, AlertTriangle, CheckCircle, XCircle, Loader2,
  ChevronDown, ChevronRight, Users, Settings
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

type VendorTab = 'overview' | 'products' | 'orders' | 'analytics' | 'settings';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

export default function VendorDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VendorTab>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order received', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Low stock alert', time: '1 hour ago', type: 'warning' },
    { id: 3, message: 'Product approved', time: '3 hours ago', type: 'success' },
  ]);
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
    if (user.role !== 'vendor') {
      navigate('/profile');
      return;
    }
    void loadOverview();
  }, [loading, navigate, user]);

  const stats = useMemo(
    () =>
      overview
        ? [
            { label: 'Total Products', value: overview.stats.totalProducts, icon: Package, color: 'text-emerald-500', change: '+18%', trend: 'up' },
            { label: 'Total Orders', value: overview.stats.totalOrders || 0, icon: ShoppingCart, color: 'text-purple-500', change: '+8%', trend: 'up' },
            { label: 'Revenue', value: overview.stats.totalRevenue, icon: DollarSign, color: 'text-amber-500', change: '+23%', trend: 'up' },
            { label: 'Avg Rating', value: '4.8', icon: Star, color: 'text-yellow-500', change: '+0.3', trend: 'up' },
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Store className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold">Vendor Dashboard</h1>
                <p className="text-xs text-gray-400">Velora Vendor Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5" />
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
                  <p className="text-xs text-gray-400">Vendor</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
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
                onClick={() => setActiveTab(tab.id as VendorTab)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                  activeTab === tab.id 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "hover:bg-white/10 text-gray-300"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="w-1 h-6 bg-blue-500 rounded-full ml-auto"
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
                  <h2 className="text-2xl font-bold">Vendor Overview</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <h2 className="text-2xl font-bold">Sales Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <BarChart3 className="w-16 h-16" />
                        <p className="ml-3">Revenue chart coming soon</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <PieChart className="w-16 h-16" />
                        <p className="ml-3">Performance metrics coming soon</p>
                      </div>
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
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
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
                            <th className="text-left p-4">Price</th>
                            <th className="text-left p-4">Stock</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Sales</th>
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
                              <td className="p-4">{product.sales || 0}</td>
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

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Orders Management</h2>
                    <div className="flex items-center space-x-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                        className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="all">All Status</option>
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
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
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                  order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                                  order.status === 'delivered' ? 'bg-cyan-500/20 text-cyan-400' :
                                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {order.status}
                                </span>
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
                  <h2 className="text-2xl font-bold">Vendor Settings</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Store Name</p>
                            <p className="text-sm text-gray-400">Your store display name</p>
                          </div>
                          <input
                            type="text"
                            defaultValue="My Store"
                            className="px-3 py-1 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Store Email</p>
                            <p className="text-sm text-gray-400">Customer contact email</p>
                          </div>
                          <input
                            type="email"
                            defaultValue={user?.email}
                            className="px-3 py-1 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order Notifications</p>
                            <p className="text-sm text-gray-400">Get notified of new orders</p>
                          </div>
                          <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Low Stock Alerts</p>
                            <p className="text-sm text-gray-400">Alert when stock is low</p>
                          </div>
                          <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                          </button>
                        </div>
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
