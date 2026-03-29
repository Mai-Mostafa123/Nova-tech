import { useEffect, useMemo, useState } from 'react';
import { Cpu, Gamepad2, Headphones, Home, Laptop, LayoutGrid, Monitor, Smartphone, Watch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storefrontApi } from '../services/storefrontApi';
import type { Category } from '../types';

const iconMap = [
  { match: /mobile|phone/i, icon: Smartphone, color: 'text-blue-400' },
  { match: /computer|laptop/i, icon: Laptop, color: 'text-emerald-400' },
  { match: /gaming/i, icon: Gamepad2, color: 'text-fuchsia-400' },
  { match: /electronic/i, icon: Cpu, color: 'text-amber-400' },
  { match: /smart-home|home/i, icon: Home, color: 'text-orange-400' },
  { match: /wearable|watch/i, icon: Watch, color: 'text-rose-400' },
  { match: /accessor/i, icon: Headphones, color: 'text-indigo-400' },
  { match: /monitor|display/i, icon: Monitor, color: 'text-cyan-400' },
];

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    storefrontApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const items = useMemo(() => {
    return categories.map((category) => {
      const matched = iconMap.find((item) => item.match.test(category.slug));
      return {
        ...category,
        icon: matched?.icon || LayoutGrid,
        color: matched?.color || 'text-white',
      };
    });
  }, [categories]);

  return (
    <div className="overflow-x-auto border-b border-white/5 bg-black/40 no-scrollbar">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-max items-center gap-5 py-4">
          <Link
            to="/products"
            className="group flex min-w-[120px] flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-all hover:border-emerald-500/30 hover:bg-white/[0.06]"
          >
            <div className="rounded-2xl bg-white/5 p-3 transition-all group-hover:scale-110 group-hover:bg-white/10">
              <LayoutGrid className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/45 transition-colors group-hover:text-white">
              All Products
            </span>
          </Link>

          {items.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex min-w-[120px] flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-all hover:border-emerald-500/30 hover:bg-white/[0.06]"
            >
              <div className="rounded-2xl bg-white/5 p-3 transition-all group-hover:scale-110 group-hover:bg-white/10">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors group-hover:text-white">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
