import { useMemo, useState } from 'react';
import { ArrowRight, Heart, Search, ShoppingCart, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function WishlistPage() {
  const [query, setQuery] = useState('');
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { wishlistItems, addToCart, toggleWishlist, loading } = useCommerce();

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return wishlistItems;
    }

    return wishlistItems.filter((item) =>
      [item.product.name, item.product.brand, item.product.category].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query, wishlistItems]);

  const wishlistValue = wishlistItems.reduce((sum, item) => sum + item.product.price, 0);

  const moveAllToCart = async () => {
    for (const item of wishlistItems) {
      await addToCart(item.productId, 1);
    }
    toast.success('Wishlist items moved to cart');
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Heart className="mb-6 h-16 w-16 text-white/10" />
        <h2 className="mb-4 text-2xl font-bold text-white">{t('wishlist.login')}</h2>
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
            {t('wishlist.title').split(' ')[0]} <span className="italic text-white/40">{t('wishlist.title').split(' ')[1]}</span>
          </h1>
          <p className="mt-3 text-sm text-white/50">Save products, search them quickly, and move your favorite picks into the cart in one tap.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Saved</p>
            <p className="mt-2 text-2xl font-black text-white">{wishlistItems.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Visible</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{filteredItems.length}</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Value</p>
            <p className="mt-2 text-2xl font-black text-white">{formatPrice(wishlistValue)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved products..." className="w-full rounded-full border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none" />
        </div>
        <button onClick={() => void moveAllToCart()} disabled={wishlistItems.length === 0} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-all hover:bg-emerald-400 disabled:opacity-50">
          <ShoppingCart className="h-4 w-4" />
          Move All To Cart
        </button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04] backdrop-blur-sm transition-all hover:border-emerald-500/40">
              <div className="relative aspect-square overflow-hidden">
                <img src={item.product.images[0]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" referrerPolicy="no-referrer" />
                <button
                  onClick={() => void toggleWishlist(item.productId)}
                  className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white/60 transition-all hover:bg-black/60 hover:text-red-500"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
                {item.product.discount > 0 && (
                  <div className="absolute left-4 top-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    -{item.product.discount}% offer
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">{item.product.brand}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{item.product.category}</span>
                </div>
                <h3 className="line-clamp-1 text-sm font-bold text-white">{item.product.name}</h3>
                <p className="mt-3 text-lg font-bold text-emerald-500">{formatPrice(item.product.price)}</p>
                <div className="mt-auto pt-6">
                  <div className="mb-4 flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    Ready for a later checkout
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/product/${item.productId}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white/10"
                    >
                      View Details
                    </Link>
                    <button onClick={() => void addToCart(item.productId, 1)} className="rounded-full bg-emerald-500 p-3 text-black transition-colors hover:bg-emerald-400">
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 py-32 text-center">
          <Heart className="mb-6 h-12 w-12 text-white/10" />
          <p className="text-white/40">{t('wishlist.empty')}</p>
          <Link to="/products" className="group mt-6 flex items-center gap-2 text-sm font-bold text-emerald-500 hover:underline">
            {t('nav.products')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
