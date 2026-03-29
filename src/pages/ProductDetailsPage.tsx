import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Heart, RotateCcw, Send, ShieldCheck, ShoppingCart, Star, Truck, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { cn } from '../lib/utils';
import { trackProductView } from '../lib/userActivity';
import { storefrontApi } from '../services/storefrontApi';
import type { Product, Review } from '../types';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useCommerce();

  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCartFeedback, setShowCartFeedback] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    Promise.all([storefrontApi.getProduct(id), storefrontApi.getProductReviews(id), storefrontApi.getProducts()])
      .then(([productData, reviewsData, allProducts]) => {
        if (cancelled) {
          return;
        }

        setProduct(productData);
        setReviews(reviewsData);
        setProducts(allProducts);
        setSelectedColor(productData.colors[0] || productData.variants?.colors?.[0] || null);
        setSelectedSize(productData.sizes[0] || productData.variants?.storage?.[0] || null);
        setSelectedImage(productData.images[0] || null);
      })
      .catch((error) => {
        console.error('Failed to load product details', error);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (product) {
      trackProductView(product.id);
    }
  }, [product?.id]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products.filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">Product not found</h2>
        <button onClick={() => navigate('/products')} className="text-emerald-500 hover:underline">
          Back to products
        </button>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) : String(product.rating);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch (error) {
      toast.error('Could not update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, 1, {
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
      });
      setShowCartFeedback(true);
      window.setTimeout(() => setShowCartFeedback(false), 2000);
    } catch (error) {
      toast.error('Could not add product to cart');
    }
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const review = await storefrontApi.createReview(id, newReview);
      setReviews((prev) => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted');
    } catch (error) {
      toast.error('Could not submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const specEntries = Object.entries(product.specifications || {});

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
        <button onClick={() => navigate('/')} className="transition-colors hover:text-white">
          Home
        </button>
        <ChevronRight className="h-3 w-3" />
        <button
          onClick={() => navigate(`/category/${product.categoryInfo?.slug || product.category.toLowerCase().replace(/\s+/g, '-')}`)}
          className="transition-colors hover:text-white"
        >
          {product.category}
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">{product.name}</span>
      </div>

      <div className="mb-24 grid grid-cols-1 gap-12 xl:grid-cols-[1.05fr_0.95fr] xl:gap-16">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="aspect-square overflow-hidden rounded-[2rem] border border-white/5 bg-white/5">
            <img src={selectedImage || product.images[0]} className="h-full w-full object-cover" alt={product.name} referrerPolicy="no-referrer" />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {(product.images.length > 1 ? product.images : [product.images[0], product.images[0], product.images[0], product.images[0]])
              .slice(0, 4)
              .map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    'aspect-square overflow-hidden rounded-2xl border bg-white/5 transition-colors',
                    selectedImage === image ? 'border-emerald-500' : 'border-white/5 hover:border-emerald-500'
                  )}
                >
                  <img src={image} className="h-full w-full object-cover opacity-70 hover:opacity-100" alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-8 rounded-[2rem] border border-white/8 bg-white/[0.04] p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">{product.brand}</span>
                {product.badge && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn('h-3 w-3', star <= Math.floor(Number(averageRating)) ? 'fill-emerald-500 text-emerald-500' : 'text-white/20')} />
                  ))}
                </div>
                <span className="text-xs font-bold text-white/40">{reviews.length || product.reviewCount} reviews</span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-4xl font-bold text-white">{formatPrice(product.price)}</span>
              {product.discount > 0 && (
                <span className="text-lg text-white/20 line-through">{formatPrice(product.price / (1 - product.discount / 100))}</span>
              )}
              <span
                className={cn(
                  'rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em]',
                  product.inStock !== false && product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-300'
                )}
              >
                {product.inStock !== false && product.stock > 0 ? `In stock • ${product.stock} available` : 'Out of stock'}
              </span>
            </div>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Select Color: <span className="text-white">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'rounded-full border px-6 py-2 text-xs font-bold transition-all',
                        selectedColor === color ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-8">
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Size / Storage: <span className="text-white">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'rounded-full border px-6 py-2 text-xs font-bold transition-all',
                        selectedSize === size ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false || product.stock <= 0}
                className="flex items-center justify-center gap-3 rounded-full bg-emerald-500 py-4 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
              <button
                onClick={() => void handleWishlist()}
                className={cn(
                  'flex items-center justify-center gap-3 rounded-full border py-4 text-sm font-bold transition-all',
                  isWishlisted(product.id) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                )}
              >
                <Heart className={cn('h-5 w-5', isWishlisted(product.id) && 'fill-current')} /> {isWishlisted(product.id) ? 'Saved' : 'Wishlist'}
              </button>

              <AnimatePresence>
                {showCartFeedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 right-0 -top-12 flex justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black shadow-lg">
                      <CheckCircle2 className="h-3 w-3" /> Added to cart
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.04] p-4">
              <div className="rounded-full bg-white/5 p-2">
                <Truck className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Free Global Shipping</span>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.04] p-4">
              <div className="rounded-full bg-white/5 p-2">
                <RotateCcw className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">30-Day Returns</span>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.04] p-4">
              <div className="rounded-full bg-white/5 p-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-24">
        <h2 className="mb-10 border-b border-white/5 pb-4 text-2xl font-bold text-white">
          Technical <span className="italic text-white/40">Specifications</span>
        </h2>
        {specEntries.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-20 gap-y-6 md:grid-cols-2">
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border-b border-white/5 py-4">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">{key}</span>
                <span className="text-sm font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 p-8 text-sm text-white/40">Specifications will appear here once this product is enriched in the admin dashboard.</div>
        )}
      </section>

      <section className="mb-24">
        <h2 className="mb-10 text-2xl font-bold text-white">
          Related <span className="italic text-white/40">Products</span>
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <section className="max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white">
            Customer <span className="italic text-white/40">Reviews</span>
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
              <span className="text-xl font-bold text-white">{averageRating}</span>
            </div>
            <span className="text-sm text-white/40">{reviews.length} reviews</span>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mb-16 grid grid-cols-1 items-center gap-12 rounded-3xl border border-white/5 bg-white/5 p-8 md:grid-cols-2">
            <div className="text-center md:text-left">
              <p className="mb-2 text-5xl font-bold text-white">{averageRating}</p>
              <div className="mb-2 flex items-center justify-center gap-1 md:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={cn('h-4 w-4', star <= Math.floor(Number(averageRating)) ? 'fill-emerald-500 text-emerald-500' : 'text-white/10')} />
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Based on {reviews.length} reviews</p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((review) => review.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <span className="w-4 text-[10px] font-bold text-white/40">{rating}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-[10px] font-bold text-white/40">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmitReview} className="mb-16 rounded-3xl border border-white/5 bg-white/5 p-8">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">Leave a Review</h3>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })} className="p-1 transition-transform hover:scale-110">
                      <Star className={cn('h-6 w-6', star <= newReview.rating ? 'fill-emerald-500 text-emerald-500' : 'text-white/10')} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Your Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(event) => setNewReview({ ...newReview, comment: event.target.value })}
                  placeholder="Share your experience with this product..."
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Review'} <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-16 rounded-3xl border border-dashed border-white/10 p-8 text-center">
            <p className="mb-4 text-sm text-white/40">Please login to leave a review</p>
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-emerald-500 hover:underline">
              Login Now
            </button>
          </div>
        )}

        <div className="space-y-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="group">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-bold text-white">{review.customerName}</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={cn('h-3 w-3', star <= review.rating ? 'fill-emerald-500 text-emerald-500' : 'text-white/10')} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">{review.comment}</p>
                    <span className="mt-4 block text-[10px] uppercase tracking-widest text-white/20">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm italic text-white/20">No reviews yet. Be the first to review this product.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
