import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, LayoutGrid, List, Search, Sparkles, X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SidebarFilters from '../components/SidebarFilters';
import { usePageTitle } from '../hooks/usePageTitle';
import { cn } from '../lib/utils';
import { storefrontApi } from '../services/storefrontApi';
import type { Category, Product } from '../types';

type SortBy = 'popular' | 'rating' | 'price-asc' | 'price-desc' | 'newest';
type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';
type PriceFilter = 'all' | 'under-5000' | '5000-15000' | '15000-30000' | '30000-plus';

const SMART_ZONES = [
  {
    id: 'mobiles',
    title: 'Mobile Zone',
    subtitle: 'Pocket intelligence with camera, power, and connected speed.',
    accent: 'cyan' as const,
    matcher: (product: Product) => /mobile|phone/i.test(product.category),
  },
  {
    id: 'audio',
    title: 'Audio Zone',
    subtitle: 'Immersive listening, battery life, and wireless freedom.',
    accent: 'fuchsia' as const,
    matcher: (product: Product) => /audio|accessories/i.test(product.category) || /headphone|speaker|noise/i.test(product.name),
  },
  {
    id: 'smart-home',
    title: 'Smart Home Zone',
    subtitle: 'Voice, automation, and calm control for the connected home.',
    accent: 'amber' as const,
    matcher: (product: Product) => /smart home|home/i.test(product.category),
  },
  {
    id: 'gaming',
    title: 'Gaming Zone',
    subtitle: 'Fast refresh, low latency, and setup-ready gear for play.',
    accent: 'emerald' as const,
    matcher: (product: Product) => /gaming/i.test(product.category),
  },
];

export default function ProductPage() {
  usePageTitle('Products');

  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityFilter>('all');
  const [selectedFeatured, setSelectedFeatured] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceFilter>('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSelectedCategory(category || '');
  }, [category]);

  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([storefrontApi.getProducts(), storefrontApi.getCategories()])
      .then(([productData, categoryData]) => {
        if (!cancelled) {
          setProducts(productData);
          setCategories(categoryData);
        }
      })
      .catch((error) => {
        console.error('Failed to load products', error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    let nextProducts = [...products];

    if (selectedCategory) {
      nextProducts = nextProducts.filter(
        (product) =>
          product.categoryInfo?.slug === selectedCategory ||
          product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    if (query) {
      nextProducts = nextProducts.filter((product) =>
        [product.name, product.description, product.brand, product.category, ...(product.tags || [])].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }

    if (selectedBrand) {
      nextProducts = nextProducts.filter((product) => product.brand === selectedBrand);
    }

    if (selectedAvailability === 'in-stock') {
      nextProducts = nextProducts.filter((product) => product.inStock !== false && product.stock > 0);
    }

    if (selectedAvailability === 'out-of-stock') {
      nextProducts = nextProducts.filter((product) => product.inStock === false || product.stock <= 0);
    }

    if (selectedFeatured) {
      nextProducts = nextProducts.filter((product) => product.featured);
    }

    if (selectedPrice !== 'all') {
      nextProducts = nextProducts.filter((product) => {
        switch (selectedPrice) {
          case 'under-5000':
            return product.price < 5000;
          case '5000-15000':
            return product.price >= 5000 && product.price <= 15000;
          case '15000-30000':
            return product.price > 15000 && product.price <= 30000;
          case '30000-plus':
            return product.price > 30000;
          default:
            return true;
        }
      });
    }

    if (selectedRating > 0) {
      nextProducts = nextProducts.filter((product) => product.rating >= selectedRating);
    }

    switch (sortBy) {
      case 'rating':
        nextProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        nextProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        nextProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        nextProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
      default:
        nextProducts.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
        break;
    }

    return nextProducts;
  }, [products, searchInput, selectedAvailability, selectedBrand, selectedCategory, selectedFeatured, selectedPrice, selectedRating, sortBy]);

  const featuredProducts = useMemo(
    () => filteredProducts.filter((product) => product.featured).slice(0, 3),
    [filteredProducts]
  );

  const smartZones = useMemo(
    () =>
      SMART_ZONES.map((zone) => ({
        ...zone,
        products: filteredProducts.filter(zone.matcher).slice(0, 4),
      })).filter((zone) => zone.products.length > 0),
    [filteredProducts]
  );

  const suggestions = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }

    return products
      .filter((product) => [product.name, product.brand, product.category].some((value) => value.toLowerCase().includes(query)))
      .slice(0, 6);
  }, [products, searchInput]);

  const activeFilters = useMemo(() => {
    const filters: Array<{ id: string; label: string; onRemove: () => void }> = [];

    if (searchInput.trim()) {
      filters.push({ id: 'search', label: `Search: ${searchInput.trim()}`, onRemove: () => setSearchInput('') });
    }
    if (selectedCategory) {
      filters.push({
        id: 'category',
        label: categories.find((item) => item.slug === selectedCategory)?.name || selectedCategory,
        onRemove: () => {
          setSelectedCategory('');
          navigate('/products');
        },
      });
    }
    if (selectedBrand) {
      filters.push({ id: 'brand', label: selectedBrand, onRemove: () => setSelectedBrand('') });
    }
    if (selectedAvailability !== 'all') {
      filters.push({ id: 'availability', label: selectedAvailability.replace('-', ' '), onRemove: () => setSelectedAvailability('all') });
    }
    if (selectedFeatured) {
      filters.push({ id: 'featured', label: 'Featured', onRemove: () => setSelectedFeatured(false) });
    }
    if (selectedPrice !== 'all') {
      filters.push({ id: 'price', label: selectedPrice.replace(/-/g, ' '), onRemove: () => setSelectedPrice('all') });
    }
    if (selectedRating > 0) {
      filters.push({ id: 'rating', label: `${selectedRating}+ stars`, onRemove: () => setSelectedRating(0) });
    }

    return filters;
  }, [categories, navigate, searchInput, selectedAvailability, selectedBrand, selectedCategory, selectedFeatured, selectedPrice, selectedRating]);

  const title = selectedCategory
    ? categories.find((item) => item.slug === selectedCategory)?.name || selectedCategory.replace(/-/g, ' ')
    : 'Smart Device Universe';

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedAvailability('all');
    setSelectedFeatured(false);
    setSelectedPrice('all');
    setSelectedRating(0);
    setSearchInput('');
    setSelectedCategory('');
    navigate('/products');
  };

  const applyCategory = (nextCategory: string) => {
    setSelectedCategory(nextCategory);
    navigate(nextCategory ? `/category/${nextCategory}` : '/products');
  };

  const isDiscoveryMode = activeFilters.length === 0;

  return (
    <div className="mx-auto max-w-[1680px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 sm:p-8 lg:p-10">
        <div className="absolute -right-14 top-8 hidden h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl lg:block" />
        <div className="absolute bottom-0 right-0 hidden h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl lg:block" />

        <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr] xl:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Tech Experience
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
              Explore premium smart devices through curated zones, live filters, and frictionless product discovery designed to feel like one connected tech world.
            </p>

            <div className="relative mt-8 max-w-3xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
              <input
                value={searchInput}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search devices, brands, or smart zones..."
                className="w-full rounded-full border border-white/10 bg-black/35 py-4 pl-14 pr-14 text-sm text-white transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950/96 p-3 shadow-2xl backdrop-blur-xl"
                  >
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-all hover:bg-white/5"
                      >
                        <img src={product.images[0]} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{product.name}</p>
                          <p className="mt-1 text-xs text-white/40">{product.brand} · {product.category}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/35" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-2">
            {[
              { label: 'Visible devices', value: filteredProducts.length },
              { label: 'Smart zones', value: smartZones.length || 4 },
              { label: 'Brands', value: brands.length },
              { label: 'In stock', value: filteredProducts.filter((product) => product.inStock !== false && product.stock > 0).length },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <SidebarFilters
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          selectedAvailability={selectedAvailability}
          selectedFeatured={selectedFeatured}
          selectedPrice={selectedPrice}
          selectedRating={selectedRating}
          onCategoryChange={applyCategory}
          onBrandChange={setSelectedBrand}
          onAvailabilityChange={setSelectedAvailability}
          onFeaturedChange={setSelectedFeatured}
          onPriceChange={setSelectedPrice}
          onRatingChange={setSelectedRating}
          onClear={clearFilters}
        />

        <div className="min-w-0 flex-1 space-y-8">
          {activeFilters.length > 0 && (
            <div className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">Active Filters</p>
                  <p className="mt-1 text-sm text-white/55">Tap any tag to remove it instantly.</p>
                </div>
                <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35 transition-colors hover:text-white">
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={filter.onRemove}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/20 hover:text-white"
                  >
                    {filter.label}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isDiscoveryMode && !isLoading && featuredProducts.length > 0 && (
            <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">Featured Spotlight</p>
                  <h2 className="mt-2 text-3xl font-black text-white">Premium devices that define the smart experience</h2>
                </div>
                <p className="max-w-lg text-sm text-white/50">Larger cards surface the products that deserve first attention before the user dives into the rest of the catalog.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                {featuredProducts[0] && (
                  <ProductCard
                    product={featuredProducts[0]}
                    size="feature"
                    accent="emerald"
                    className="xl:col-span-2"
                  />
                )}
                <div className="grid grid-cols-1 gap-6 xl:col-span-2">
                  {featuredProducts.slice(1).map((product, index) => (
                    <ProductCard key={product.id} product={product} size="wide" accent={index % 2 === 0 ? 'cyan' : 'fuchsia'} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {isDiscoveryMode && !isLoading && smartZones.length > 0 && (
            <section className="space-y-8">
              {smartZones.map((zone) => (
                <div key={zone.id} className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 sm:p-6">
                  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">{zone.id.replace('-', ' ')}</p>
                      <h2 className="mt-2 text-2xl font-black text-white">{zone.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{zone.subtitle}</p>
                    </div>
                    <button
                      onClick={() => {
                        const zoneCategory = zone.products[0]?.categoryInfo?.slug || zone.products[0]?.category.toLowerCase().replace(/\s+/g, '-');
                        navigate(zoneCategory ? `/category/${zoneCategory}` : '/products');
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Explore zone
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    {zone.products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        accent={zone.accent}
                        size={index === 0 ? 'wide' : 'default'}
                        className={cn(index === 0 ? 'xl:col-span-6' : 'xl:col-span-3')}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">All Devices</p>
                <h2 className="mt-2 text-2xl font-black text-white">Smooth catalog browsing with instant controls</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('rounded-2xl p-3 transition-colors', viewMode === 'grid' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('rounded-2xl p-3 transition-colors', viewMode === 'list' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white')}
                >
                  <List className="h-4 w-4" />
                </button>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortBy)}
                    className="appearance-none rounded-full border border-white/10 bg-black/30 px-5 py-3 pr-10 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={cn('grid gap-6', viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3')}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="overflow-hidden rounded-[2rem] border border-white/5 bg-white/5">
                    <div className="h-72 animate-pulse bg-white/8" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-white/8" />
                      <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/8" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
                      <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn('grid gap-6', viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3')}>
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout={viewMode}
                    size={!isDiscoveryMode && viewMode === 'grid' && index % 5 === 0 ? 'wide' : 'default'}
                    accent={index % 4 === 0 ? 'emerald' : index % 4 === 1 ? 'cyan' : index % 4 === 2 ? 'amber' : 'fuchsia'}
                    className={cn(
                      viewMode === 'grid' && !isDiscoveryMode && index % 5 === 0 && '2xl:col-span-2'
                    )}
                  />
                ))}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <LayoutGrid className="h-8 w-8 text-white/20" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">No products found</h3>
                <p className="max-w-md text-sm text-white/40">Try another category, price band, brand, or rating. The page updates instantly while you explore.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
