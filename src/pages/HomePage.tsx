import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgePercent, ShieldCheck, Sparkles, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIRecommendations from '../components/AIRecommendations';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { getRecentProducts } from '../lib/userActivity';
import { storefrontApi } from '../services/storefrontApi';
import type { Category, Product } from '../types';

export default function HomePage() {
  usePageTitle();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offerIndex, setOfferIndex] = useState(0);
  const [miniCarouselIndex, setMiniCarouselIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([storefrontApi.getProducts(), storefrontApi.getCategories()])
      .then(([productData, categoryData]) => {
        if (!cancelled) {
          setProducts(productData);
          setCategories(categoryData);
        }
      })
      .catch((error) => {
        console.error('Failed to load homepage products', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOfferIndex((current) => (current + 1) % 3);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setMiniCarouselIndex((current) => (current + 1) % products.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [products.length]);

  const featuredProducts = useMemo(() => products.filter((product) => product.featured).slice(0, 4), [products]);
  const trendingProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const latestArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const highlightedCategories = categories.slice(0, 4);
  const recentDrivenProducts = useMemo(() => {
    const recent = getRecentProducts(products);
    if (recent.length > 0) {
      return recent;
    }

    return [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  }, [products]);
  const discountedProducts = useMemo(() => products.filter((product) => product.discount > 0).slice(0, 6), [products]);
  const megaDeals = useMemo(() => [...products].filter((product) => product.discount > 0).sort((a, b) => b.discount - a.discount).slice(0, 8), [products]);
  const miniShowcaseProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const count = Math.min(4, products.length);
    return Array.from({ length: count }, (_, offset) => products[(miniCarouselIndex + offset) % products.length]);
  }, [miniCarouselIndex, products]);

  const promoCards = [
    {
      title: 'Weekend Shock Deals',
      text: 'Extra savings on smart devices, creator setups, and premium gaming gear.',
      cta: '/products',
      badge: 'Up to 30% off',
    },
    {
      title: 'Build Your Smart Home',
      text: 'Pair hubs, speakers, and connected accessories for a calmer ecosystem.',
      cta: '/category/smart-home',
      badge: 'Bundle offers',
    },
    {
      title: 'Mobile + Wearables',
      text: 'Save more when you upgrade your phone and smartwatch together.',
      cta: '/category/mobiles',
      badge: 'Combo savings',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      <Hero />

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Offers Carousel</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Deals & <span className="italic text-white/40">Promotions</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {promoCards.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setOfferIndex(index)}
                className={`h-2.5 rounded-full transition-all ${offerIndex === index ? 'w-10 bg-emerald-400' : 'w-2.5 bg-white/15'}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
              <BadgePercent className="h-4 w-4" />
              {promoCards[offerIndex].badge}
            </p>
            <h3 className="mt-5 max-w-2xl text-4xl font-black text-white">{promoCards[offerIndex].title}</h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">{promoCards[offerIndex].text}</p>
            <Link to={promoCards[offerIndex].cta} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400">
              Explore Deal <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="pointer-events-none absolute -right-10 top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {discountedProducts.slice(0, 3).map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="flex items-center gap-4 rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 transition-all hover:border-emerald-500/20">
                <img src={product.images[0]} alt="" className="h-20 w-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-white/40">{product.brand} · {product.category}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">-{product.discount}% deal</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Mini Product Reel</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Compact <span className="italic text-white/40">Showcase</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {miniShowcaseProducts.map((product, index) => (
              <button
                key={`${product.id}-${index}`}
                type="button"
                onClick={() => setMiniCarouselIndex(products.findIndex((item) => item.id === product.id))}
                className={`h-2.5 rounded-full transition-all ${index === 0 ? 'w-10 bg-emerald-400' : 'w-2.5 bg-white/15'}`}
                aria-label={`Show ${product.name}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          {miniShowcaseProducts[0] && (
            <Link
              to={`/product/${miniShowcaseProducts[0].id}`}
              className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6"
            >
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div className="overflow-hidden rounded-[1.5rem] bg-black/30">
                  <img
                    src={miniShowcaseProducts[0].images[0]}
                    alt={miniShowcaseProducts[0].name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">{miniShowcaseProducts[0].brand}</p>
                  <h3 className="mt-3 text-3xl font-black text-white">{miniShowcaseProducts[0].name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55">{miniShowcaseProducts[0].description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {Object.entries(miniShowcaseProducts[0].specifications)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <span key={key} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                          {value}
                        </span>
                      ))}
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-3xl font-black text-white">{miniShowcaseProducts[0].price.toLocaleString()} EGP</span>
                    {miniShowcaseProducts[0].discount > 0 && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                        -{miniShowcaseProducts[0].discount}% now
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {miniShowcaseProducts.slice(1).map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group flex items-center gap-4 rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 transition-all hover:-translate-y-1 hover:border-emerald-500/20"
              >
                <img src={product.images[0]} alt="" className="h-24 w-24 rounded-[1.25rem] object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-white/40">{product.brand} · {product.category}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm font-black text-white">{product.price.toLocaleString()} EGP</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Restocking'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Truck, title: 'Fast fulfillment', text: 'Trackable orders, shipping states, and ready checkout flows.' },
            { icon: ShieldCheck, title: 'Protected accounts', text: 'OTP-based signup, profile updates, and role-aware dashboards.' },
            { icon: Zap, title: 'Live storefront', text: 'Products, stock, cart, wishlist, and admin actions share one backend source.' },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3">
                <item.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Mega Discounts</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Offers <span className="italic text-white/40">Across Velora</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            Unlock savings <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {megaDeals.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 transition-all hover:-translate-y-1 hover:border-emerald-500/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Save {product.discount}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{product.category}</span>
              </div>
              <h3 className="text-lg font-black text-white">{product.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{product.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xl font-black text-white">{product.price.toLocaleString()} EGP</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">{product.brand}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Flash Savings</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Discounted <span className="italic text-white/40">Highlights</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            See all deals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {discountedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} accent={index % 2 === 0 ? 'amber' : 'emerald'} size={index === 0 ? 'wide' : 'default'} className={index === 0 ? '2xl:col-span-2' : ''} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Browse Faster</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Expanded <span className="italic text-white/40">Categories</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            Open Catalog <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlightedCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04] transition-all hover:-translate-y-1 hover:border-emerald-500/25 sm:rounded-[2rem]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">{category.productsCount || 0} products</p>
                <h3 className="mt-2 text-sm font-bold text-white sm:mt-3 sm:text-xl">{category.name}</h3>
                <p className="mt-2 hidden text-sm leading-relaxed text-white/50 sm:mt-3 sm:block">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Curated Selection</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Featured <span className="italic text-white/40">Innovations</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} compactMobile />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-emerald-500 px-8 py-16 sm:px-16 sm:py-24">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
              Upgrade Your <br />
              Digital Ecosystem.
            </h2>
            <p className="mt-6 text-lg text-black/70">
              The storefront is now powered by the local backend, so inventory, cart, orders, and dashboards all reflect the same live data.
            </p>
            <Link to="/products" className="mt-10 inline-flex rounded-full bg-black px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white hover:text-black">
              Shop Now
            </Link>
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent" />
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

      <AIRecommendations />

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">For You</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Personalized <span className="italic text-white/40">Recommendations</span>
            </h2>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('velora:open-assistant', { detail: { prompt: 'Recommend a personalized smart setup for me.' } }))}
            className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500"
          >
            Ask AI <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentDrivenProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} accent={index % 2 === 0 ? 'cyan' : 'emerald'} compactMobile />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Shop Like a Universe</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ecosystems <span className="italic text-white/40">That Connect</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            Discover more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {[
            {
              title: 'Creator Desk',
              text: 'Laptops, monitors, keyboards, and audio gear arranged like a complete productivity stack.',
              products: products.filter((product) => /computer|accessories/i.test(product.category)).slice(0, 2),
            },
            {
              title: 'Mobile Command',
              text: 'Phones, wearables, and wireless essentials that move together as one smart layer.',
              products: products.filter((product) => /mobile|wearables/i.test(product.category)).slice(0, 2),
            },
            {
              title: 'Play & Home',
              text: 'Gaming meets smart living with immersive hardware and connected home control.',
              products: products.filter((product) => /gaming|smart home/i.test(product.category)).slice(0, 2),
            },
          ].map((zone, index) => (
            <div key={zone.title} className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Zone 0{index + 1}</p>
              <h3 className="mt-3 text-2xl font-black text-white">{zone.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{zone.text}</p>
              <div className="mt-6 space-y-4">
                {zone.products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                    <img src={product.images[0]} alt="" className="h-16 w-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-bold text-white">{product.name}</p>
                      <p className="mt-1 text-xs text-white/40">{product.brand} · {product.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-500">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Hot Right Now</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Trending <span className="italic text-white/40">Gear</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} compactMobile />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">New Sections</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Latest <span className="italic text-white/40">Arrivals</span>
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-white/60 transition-colors hover:text-emerald-500">
            Browse all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestArrivals.map((product) => (
            <ProductCard key={product.id} product={product} compactMobile />
          ))}
        </div>
      </section>
    </div>
  );
}
