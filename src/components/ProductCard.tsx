import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BatteryCharging, Cpu, Eye, Heart, ShoppingCart, Sparkles, Star, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { cn } from '../lib/utils';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
  layout?: 'grid' | 'list';
  size?: 'default' | 'feature' | 'wide';
  accent?: 'emerald' | 'cyan' | 'amber' | 'fuchsia';
  className?: string;
  compactMobile?: boolean;
}

const accentStyles = {
  emerald: 'from-emerald-500/30 via-emerald-500/8 to-transparent',
  cyan: 'from-cyan-500/30 via-cyan-500/8 to-transparent',
  amber: 'from-amber-500/30 via-amber-500/8 to-transparent',
  fuchsia: 'from-fuchsia-500/30 via-fuchsia-500/8 to-transparent',
};

export default function ProductCard({
  product,
  layout = 'grid',
  size = 'default',
  accent = 'emerald',
  className,
  compactMobile = false,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useCommerce();
  const [showCartFeedback, setShowCartFeedback] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const quickSpecs = useMemo(() => {
    const entries = Object.entries(product.specifications || {});
    const batteryEntry = entries.find(([key]) => /battery/i.test(key));
    const connectivityEntry = entries.find(([key, value]) => /wifi|bluetooth|connection|network|5g/i.test(`${key} ${value}`));
    const smartEntry = entries.find(([key, value]) => /ai|chip|processor|voice|smart/i.test(`${key} ${value}`));

    return [
      batteryEntry ? { icon: BatteryCharging, label: String(batteryEntry[1]) } : null,
      connectivityEntry ? { icon: Wifi, label: String(connectivityEntry[1]) } : null,
      smartEntry ? { icon: Cpu, label: String(smartEntry[1]) } : { icon: Sparkles, label: 'Smart ready' },
    ].filter(Boolean) as Array<{ icon: typeof BatteryCharging; label: string }>;
  }, [product.specifications]);

  const handleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const handleAddToCart = async (event: React.MouseEvent, options?: { selectedColor?: string; selectedSize?: string }) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, 1, {
        selectedColor: options?.selectedColor,
        selectedSize: options?.selectedSize,
      });
      setShowCartFeedback(true);
      window.setTimeout(() => setShowCartFeedback(false), 1800);
    } catch {
      toast.error('Could not add product to cart');
    }
  };

  const imageHeightClass = compactMobile
    ? size === 'feature'
      ? 'min-h-[140px] sm:min-h-[200px] lg:min-h-[280px]'
      : size === 'wide'
        ? 'min-h-[120px] sm:min-h-[180px] lg:min-h-[240px]'
        : 'min-h-[120px] sm:min-h-[160px] lg:min-h-[200px]'
    : size === 'feature'
      ? 'min-h-[280px] lg:min-h-[360px]'
      : size === 'wide'
        ? 'min-h-[220px] lg:min-h-[280px]'
        : 'min-h-[200px] lg:min-h-[240px]';

  const isList = layout === 'list';

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.05] backdrop-blur-sm transition-all hover:border-white/15',
          isList ? 'grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]' : 'flex flex-col',
          className
        )}
      >
        <div className={cn('relative overflow-hidden', isList ? 'h-full min-h-[200px]' : imageHeightClass)}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className={cn('absolute inset-0 bg-gradient-to-br', accentStyles[accent])} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          <div className={cn('absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4', compactMobile && 'gap-1.5')}>
            {product.badge && (
              <span className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white sm:px-3 sm:text-[10px]">
                {product.badge}
              </span>
            )}
            {product.discount > 0 && <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-black sm:px-3 sm:text-[10px]">-{product.discount}%</span>}
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] sm:px-3 sm:text-[10px]',
                product.inStock !== false ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
              )}
            >
              {product.inStock !== false ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <div className="absolute right-3 top-3 hidden flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:right-4 sm:top-4 sm:flex">
            <button
              onClick={handleWishlist}
              className={cn(
                'rounded-full border border-white/10 bg-black/45 p-2.5 transition-all',
                wishlisted ? 'text-emerald-400' : 'text-white/60 hover:text-red-400'
              )}
            >
              <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShowQuickView(true);
              }}
              className="rounded-full border border-white/10 bg-black/45 p-2.5 text-white/70 transition-all hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute inset-x-4 bottom-4 hidden translate-y-4 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
            <button
              onClick={(event) => void handleAddToCart(event)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-all hover:bg-emerald-400"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShowQuickView(true);
              }}
              className="rounded-full border border-white/15 bg-black/45 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 transition-all hover:bg-black/60"
            >
              Quick view
            </button>
          </div>

          <AnimatePresence>
            {showCartFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-emerald-500 p-2 text-black">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Added to Cart</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={cn('relative flex flex-1 flex-col p-4 sm:p-6', isList && 'justify-between', compactMobile && !isList && 'p-3.5 sm:p-6')}>
          <div>
            <div className={cn('mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3', compactMobile && 'mb-2')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('font-bold uppercase tracking-[0.22em] text-emerald-400', compactMobile ? 'text-[9px] sm:text-[10px]' : 'text-[10px]')}>{product.brand}</span>
                <span className={cn('rounded-full border border-white/10 px-2.5 py-1 font-bold uppercase tracking-[0.2em] text-white/45', compactMobile ? 'text-[9px] sm:px-3 sm:text-[10px]' : 'px-3 text-[10px]')}>
                  {product.category}
                </span>
              </div>
              <div className={cn('flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 sm:px-3', compactMobile && 'px-2')}>
                <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                <span className={cn('font-bold text-white/70', compactMobile ? 'text-[9px] sm:text-[10px]' : 'text-[10px]')}>
                  {product.rating} · {product.reviewCount}
                </span>
              </div>
            </div>

            <h3 className={cn('font-black text-white transition-colors group-hover:text-emerald-400', isList ? 'text-2xl' : size === 'feature' ? 'text-2xl sm:text-3xl' : compactMobile ? 'text-sm sm:text-lg' : 'text-lg')}>
              {product.name}
            </h3>
            <p className={cn('mt-3 leading-relaxed text-white/55', isList ? 'max-w-2xl text-sm' : compactMobile ? 'hidden sm:line-clamp-3 sm:text-sm' : 'line-clamp-3 text-sm')}>
              {product.description}
            </p>
          </div>

          <div className={cn('mt-5 flex flex-wrap gap-2', compactMobile && 'mt-3 hidden sm:flex')}>
            {quickSpecs.slice(0, compactMobile ? 2 : 3).map((spec, index) => (
              <span key={`${spec.label}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                <spec.icon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="line-clamp-1 max-w-[120px]">{spec.label}</span>
              </span>
            ))}
          </div>

          <div className={cn('mt-4 flex flex-wrap gap-2', compactMobile && 'mt-3 hidden sm:flex')}>
            {product.colors.slice(0, 3).map((color) => (
              <span key={color} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                {color}
              </span>
            ))}
          </div>

          <div className={cn('mt-6 flex flex-wrap items-end justify-between gap-3 sm:gap-4', compactMobile && 'mt-4')}>
            <div className="flex flex-col">
              <span className={cn('font-black text-white', compactMobile && !isList ? 'text-base sm:text-2xl' : 'text-2xl')}>{formatPrice(product.price)}</span>
              {product.discount > 0 && <span className="text-[11px] text-white/25 line-through">{formatPrice(product.price / (1 - product.discount / 100))}</span>}
            </div>

            {isList ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={(event) => void handleAddToCart(event)}
                  className="rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-emerald-400"
                >
                  Add to cart
                </button>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowQuickView(true);
                  }}
                  className="rounded-full border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  Quick view
                </button>
              </div>
            ) : compactMobile ? (
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={handleWishlist}
                  className={cn('rounded-full border border-white/10 bg-white/5 p-2.5 transition-colors', wishlisted ? 'text-emerald-400' : 'text-white/70 hover:text-white')}
                >
                  <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
                </button>
                <button
                  onClick={(event) => void handleAddToCart(event)}
                  className="rounded-full bg-white p-2.5 text-black transition-colors hover:bg-emerald-400"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="grid w-full max-w-4xl grid-cols-1 gap-8 rounded-[2rem] border border-white/10 bg-zinc-950 p-6 lg:grid-cols-[1fr_1.1fr]"
            >
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5">
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">{product.category}</p>
                  <h3 className="mt-3 text-3xl font-black text-white">{product.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">{product.description}</p>
                </div>
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
                  <span className={cn('rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest', product.inStock !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-300')}>
                    {product.inStock !== false ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="mb-6 space-y-3">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Quick highlights</p>
                    <div className="flex flex-wrap gap-2">
                      {quickSpecs.map((spec, index) => (
                        <span key={`${spec.label}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                          <spec.icon className="h-3.5 w-3.5 text-emerald-400" />
                          {spec.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <span key={color} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Sizes / Storage</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <span key={size} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-3">
                  <button
                    onClick={(event) => void handleAddToCart(event, { selectedColor: product.colors[0], selectedSize: product.sizes[0] })}
                    className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={product.inStock === false}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={async (event) => {
                      await handleWishlist(event);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
                  >
                    {wishlisted ? 'Saved' : 'Add to Wishlist'}
                  </button>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Full Details
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
