import { useMemo, useState } from 'react';
import { ArrowRight, Gift, Loader2, Minus, Plus, ShieldCheck, ShoppingCart, Sparkles, TicketPercent, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { storefrontApi } from '../services/storefrontApi';

type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'cash on delivery' | 'card on delivery' | 'wallet';

export default function CartPage() {
  usePageTitle('Cart');

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash on delivery');
  const [shippingAddress, setShippingAddress] = useState({
    street: '123 Tech Avenue',
    city: 'Cairo',
    country: 'Egypt',
  });
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const { cartItems, updateCartQuantity, removeFromCart, refreshCommerce } = useCommerce();

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const productSavings = cartItems.reduce(
    (acc, item) => acc + (item.product.discount > 0 ? (item.product.price / (1 - item.product.discount / 100) - item.product.price) * item.quantity : 0),
    0
  );
  const shippingFee = shippingMethod === 'express' ? 180 : subtotal > 15000 ? 0 : 90;
  const promoDiscount = appliedPromo === 'VELORA10' ? subtotal * 0.1 : appliedPromo === 'FREESHIP' ? shippingFee : 0;
  const total = Math.max(0, subtotal + shippingFee - promoDiscount);

  const suggestedMessage = useMemo(() => {
    if (subtotal < 15000) {
      return `Add ${formatPrice(15000 - subtotal)} more to unlock free standard shipping.`;
    }
    return 'You unlocked free standard shipping.';
  }, [formatPrice, subtotal]);

  const applyPromo = () => {
    const normalized = promoCode.trim().toUpperCase();
    if (!normalized) {
      return;
    }

    if (!['VELORA10', 'FREESHIP'].includes(normalized)) {
      toast.error('Promo code is invalid');
      return;
    }

    setAppliedPromo(normalized);
    toast.success(`Promo ${normalized} applied`);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
      toast.error('Please complete the shipping address');
      return;
    }

    setIsCheckingOut(true);
    try {
      await storefrontApi.checkout({
        paymentMethod,
        shippingAddress,
      });
      await refreshCommerce();
      toast.success('Order created successfully');
      navigate('/orders');
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Shopping <span className="italic text-white/40">Cart</span>
          </h1>
          <p className="mt-3 text-sm text-white/50">Manage quantities, shipping, payment, and local promo savings from one checkout workspace.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Items</p>
            <p className="mt-2 text-2xl font-black text-white">{cartItems.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Savings</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{formatPrice(productSavings + promoDiscount)}</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Shipping</p>
            <p className="mt-2 text-2xl font-black text-white">{shippingMethod}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-emerald-500/15 bg-emerald-500/8 p-5">
            <div className="flex items-start gap-3">
              <Gift className="mt-0.5 h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-white">Cart perks</p>
                <p className="mt-1 text-sm text-white/60">{suggestedMessage}</p>
              </div>
            </div>
          </div>

          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-5 rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 sm:flex-row sm:items-center">
                <img src={item.product.images[0]} className="h-28 w-28 rounded-[1.5rem] object-cover" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">{item.product.brand}</span>
                    {item.product.discount > 0 && (
                      <span className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                        -{item.product.discount}% discount
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">{item.product.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.selectedColor && (
                      <span className="rounded-md bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                        Color: <span className="text-white">{item.selectedColor}</span>
                      </span>
                    )}
                    {(item.selectedSize || item.selectedStorage) && (
                      <span className="rounded-md bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                        Size: <span className="text-white">{item.selectedSize || item.selectedStorage}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-white/45">{formatPrice(item.product.price)} each</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-full border border-white/10 bg-black px-3 py-1">
                    <button onClick={() => void updateCartQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-white/40 hover:text-white">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="mx-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button onClick={() => void updateCartQuantity(item.id, item.quantity + 1)} className="p-1 text-white/40 hover:text-white">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xl font-black text-white">{formatPrice(item.product.price * item.quantity)}</p>
                  <button onClick={() => void removeFromCart(item.id)} className="inline-flex items-center gap-2 rounded-full border border-red-500/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-red-400 transition-all hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 py-20 text-center">
              <ShoppingCart className="mb-6 h-12 w-12 text-white/10" />
              <p className="text-white/40">Your cart is empty</p>
              <Link to="/products" className="mt-6 text-sm font-bold text-emerald-500 hover:underline">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <div className="mb-4 flex items-center gap-2">
              <TicketPercent className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Promo Codes</h3>
            </div>
            <div className="flex gap-3">
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="VELORA10 or FREESHIP"
                className="flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
              <button onClick={applyPromo} className="rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-emerald-400">
                Apply
              </button>
            </div>
            {appliedPromo && <p className="mt-3 text-xs text-emerald-400">Active promo: {appliedPromo}</p>}
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white">Shipping Method</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { id: 'standard', label: 'Standard', note: subtotal > 15000 ? 'Free' : formatPrice(90) },
                { id: 'express', label: 'Express', note: formatPrice(180) },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setShippingMethod(option.id as ShippingMethod)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition-all ${shippingMethod === option.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-black/20 text-white'}`}
                >
                  <p className="text-sm font-bold">{option.label}</p>
                  <p className="mt-1 text-xs text-current/70">{option.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white">Payment</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                'cash on delivery',
                'card on delivery',
                'wallet',
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => setPaymentMethod(option as PaymentMethod)}
                  className={`rounded-[1.5rem] border px-4 py-4 text-left transition-all ${paymentMethod === option ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-black/20 text-white'}`}
                >
                  <p className="text-sm font-bold capitalize">{option}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white">Shipping Address</h3>
            <div className="space-y-3">
              <input value={shippingAddress.street} onChange={(event) => setShippingAddress((prev) => ({ ...prev, street: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Street" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input value={shippingAddress.city} onChange={(event) => setShippingAddress((prev) => ({ ...prev, city: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="City" />
                <input value={shippingAddress.country} onChange={(event) => setShippingAddress((prev) => ({ ...prev, country: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Country" />
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Shipping</span>
                <span className="text-white">{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Promo Discount</span>
                <span className="text-emerald-400">-{formatPrice(promoDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Product Savings</span>
                <span className="text-emerald-400">{formatPrice(productSavings)}</span>
              </div>
              <div className="flex justify-between border-t border-white/8 pt-4">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-2xl font-black text-white">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-4 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
            >
              {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Checkout'}
              {!isCheckingOut && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/25">
              <ShieldCheck className="h-4 w-4" /> Secure Checkout Workspace
            </div>
            <div className="flex items-center justify-center gap-2 rounded-full border border-white/8 bg-black/20 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-white/45">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Local financial flow ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
