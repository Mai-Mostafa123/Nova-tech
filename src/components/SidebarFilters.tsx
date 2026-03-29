import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Filter, Sparkles, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';
import type { Category } from '../types';

type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';
type PriceFilter = 'all' | 'under-5000' | '5000-15000' | '15000-30000' | '30000-plus';

interface SidebarFiltersProps {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  selectedAvailability: AvailabilityFilter;
  selectedFeatured: boolean;
  selectedPrice: PriceFilter;
  selectedRating: number;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  onFeaturedChange: (value: boolean) => void;
  onPriceChange: (value: PriceFilter) => void;
  onRatingChange: (value: number) => void;
  onClear: () => void;
}

function FilterTag({
  active,
  children,
  onClick,
}: {
  key?: string | number;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all',
        active ? 'border-white bg-white text-black shadow-[0_10px_35px_rgba(255,255,255,0.08)]' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function FilterSection({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-black/20">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">{title}</p>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-white/45 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/6 px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SidebarFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedAvailability,
  selectedFeatured,
  selectedPrice,
  selectedRating,
  onCategoryChange,
  onBrandChange,
  onAvailabilityChange,
  onFeaturedChange,
  onPriceChange,
  onRatingChange,
  onClear,
}: SidebarFiltersProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    brand: true,
    rating: true,
    availability: true,
  });

  const priceOptions = useMemo(
    () => [
      { value: 'under-5000', label: 'Under 5K' },
      { value: '5000-15000', label: '5K to 15K' },
      { value: '15000-30000', label: '15K to 30K' },
      { value: '30000-plus', label: '30K+' },
    ] as const,
    []
  );

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-full flex-shrink-0 lg:w-[330px] xl:w-[380px]">
      <div className="space-y-4 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 lg:sticky lg:top-24">
        <div className="rounded-[1.75rem] border border-emerald-500/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_55%),rgba(0,0,0,0.35)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <Filter className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em]">Smart Filters</span>
              </div>
              <h2 className="text-xl font-black text-white">Tune the tech world</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">Use tags instead of heavy menus and move through devices with zero friction.</p>
            </div>
            <button onClick={onClear} className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35 transition-colors hover:text-white">
              Reset
            </button>
          </div>

          <button
            onClick={() => onFeaturedChange(!selectedFeatured)}
            className={cn(
              'mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all',
              selectedFeatured ? 'border-emerald-500 bg-emerald-500/12 text-emerald-400' : 'border-white/10 bg-white/5 text-white'
            )}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em]">Featured drops</p>
              <p className="mt-1 text-sm text-current/70">Focus on standout launches first.</p>
            </div>
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        <FilterSection title="Category" subtitle="Move between smart worlds" open={openSections.category} onToggle={() => toggleSection('category')}>
          <div className="flex flex-wrap gap-2">
            <FilterTag active={selectedCategory === ''} onClick={() => onCategoryChange('')}>
              All
            </FilterTag>
            {categories.map((category) => (
              <FilterTag key={category.id} active={selectedCategory === category.slug} onClick={() => onCategoryChange(category.slug)}>
                {category.name}
              </FilterTag>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price" subtitle="Keep budget readable" open={openSections.price} onToggle={() => toggleSection('price')}>
          <div className="flex flex-wrap gap-2">
            <FilterTag active={selectedPrice === 'all'} onClick={() => onPriceChange('all')}>
              All
            </FilterTag>
            {priceOptions.map((option) => (
              <FilterTag key={option.value} active={selectedPrice === option.value} onClick={() => onPriceChange(option.value)}>
                {option.label}
              </FilterTag>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Brand" subtitle="Switch ecosystems fast" open={openSections.brand} onToggle={() => toggleSection('brand')}>
          <div className="flex flex-wrap gap-2">
            <FilterTag active={selectedBrand === ''} onClick={() => onBrandChange('')}>
              All
            </FilterTag>
            {brands.map((brand) => (
              <FilterTag key={brand} active={selectedBrand === brand} onClick={() => onBrandChange(brand)}>
                {brand}
              </FilterTag>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Rating" subtitle="Surface the best reviewed devices" open={openSections.rating} onToggle={() => toggleSection('rating')}>
          <div className="flex flex-wrap gap-2">
            {[0, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => onRatingChange(rating)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all',
                  selectedRating === rating ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/10 bg-white/5 text-white/65 hover:text-white'
                )}
              >
                <Star className={cn('h-3.5 w-3.5', selectedRating === rating ? 'fill-black text-black' : 'fill-amber-400 text-amber-400')} />
                {rating === 0 ? 'All ratings' : `${rating}+`}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Availability" subtitle="Only show what can ship now" open={openSections.availability} onToggle={() => toggleSection('availability')}>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => onAvailabilityChange('all')}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left text-sm transition-all',
                selectedAvailability === 'all' ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 text-white/65'
              )}
            >
              All availability
            </button>
            <button
              onClick={() => onAvailabilityChange('in-stock')}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left text-sm transition-all',
                selectedAvailability === 'in-stock' ? 'border-emerald-500 bg-emerald-500/12 text-emerald-400' : 'border-white/10 bg-white/5 text-white/65'
              )}
            >
              In stock only
            </button>
            <button
              onClick={() => onAvailabilityChange('out-of-stock')}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left text-sm transition-all',
                selectedAvailability === 'out-of-stock' ? 'border-red-400 bg-red-500/10 text-red-300' : 'border-white/10 bg-white/5 text-white/65'
              )}
            >
              Out of stock
            </button>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
