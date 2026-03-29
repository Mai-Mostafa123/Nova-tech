import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, Settings, LogOut, ChevronRight, ShieldCheck, Save, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { storefrontApi } from '../services/storefrontApi';
import type { Order } from '../types';

export default function ProfilePage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const { wishlistCount } = useCommerce();
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({ name: user.name, email: user.email, password: '' });
    storefrontApi.getMyOrders().then(setOrders).catch((error) => {
      console.error('Failed to load profile orders', error);
    });
  }, [loading, navigate, user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', count: orders.length, path: '/orders' },
    { icon: Heart, label: 'Wishlist', count: wishlistCount, path: '/wishlist' },
    ...(user.role === 'admin' ? [{ icon: ShieldCheck, label: 'Admin Dashboard', count: null, path: '/admin/dashboard' }] : []),
  ];

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
      });
      setFormData((prev) => ({ ...prev, password: '' }));
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 text-center">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} className="h-full w-full rounded-full border-2 border-emerald-500 p-1" alt="" />
              <div className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-1.5 text-black">
                <Settings className="h-3 w-3" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="mt-1 text-xs text-white/40">{user.email}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <MailCheck className="h-4 w-4" /> {user.isVerified ? 'Verified account' : 'Not verified'}
            </div>
            <div className="mt-6 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              {user.role}
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="group flex w-full items-center justify-between rounded-2xl border border-transparent bg-white/5 px-6 py-4 transition-all hover:border-white/10 hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="h-5 w-5 text-white/40 transition-colors group-hover:text-emerald-500" />
                  <span className="text-sm font-bold text-white">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.count !== null && <span className="text-[10px] font-bold text-white/20">{item.count}</span>}
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex w-full items-center gap-4 rounded-2xl bg-red-500/5 px-6 py-4 text-red-500 transition-all hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-bold">Logout</span>
            </button>
          </nav>
        </div>

        <div className="space-y-10">
          <section className="rounded-3xl border border-white/5 bg-white/5 p-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white">Profile Settings</h3>
              <p className="mt-2 text-sm text-white/40">Update your account details and password from one place.</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</label>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email</label>
                <input
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">New Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Leave blank to keep the current password"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          <section>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="rounded-3xl border border-white/5 bg-white/5 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Order #{String(order.id).padStart(6, '0')}</p>
                        <p className="mt-1 text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">{order.totalAmount.toLocaleString()} EGP</p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
                <div className="mb-4 rounded-full bg-white/5 p-4">
                  <Package className="h-8 w-8 text-white/20" />
                </div>
                <p className="text-sm text-white/40">You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/products')} className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-500 hover:underline">
                  Start Shopping
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
