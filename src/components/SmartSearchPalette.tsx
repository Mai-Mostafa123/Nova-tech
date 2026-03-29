import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storefrontApi } from '../services/storefrontApi';
import type { Category, Product } from '../types';

type PaletteItem =
  | { id: string; kind: 'product'; title: string; subtitle: string; action: () => void; image?: string }
  | { id: string; kind: 'category'; title: string; subtitle: string; action: () => void; image?: string }
  | { id: string; kind: 'assistant'; title: string; subtitle: string; action: () => void };

export default function SmartSearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    storefrontApi.getProducts().then(setProducts).catch(() => {});
    storefrontApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const onOpenPalette = () => setOpen(true);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('velora:open-search', onOpenPalette as EventListener);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('velora:open-search', onOpenPalette as EventListener);
    };
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    navigate(`/products?q=${encodeURIComponent(normalizedQuery)}`);
    setOpen(false);
  };

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const productItems = products
      .filter((product) =>
        normalizedQuery
          ? [product.name, product.brand, product.category, product.description].some((value) => value.toLowerCase().includes(normalizedQuery))
          : product.featured
      )
      .slice(0, 5)
      .map<PaletteItem>((product) => ({
        id: `product-${product.id}`,
        kind: 'product',
        title: product.name,
        subtitle: `${product.brand} · ${product.category}`,
        image: product.images[0],
        action: () => {
          navigate(`/product/${product.id}`);
          setOpen(false);
        },
      }));

    const categoryItems = categories
      .filter((category) => (normalizedQuery ? [category.name, category.description].some((value) => value.toLowerCase().includes(normalizedQuery)) : true))
      .slice(0, 4)
      .map<PaletteItem>((category) => ({
        id: `category-${category.id}`,
        kind: 'category',
        title: category.name,
        subtitle: category.description,
        image: category.image,
        action: () => {
          navigate(`/category/${category.slug}`);
          setOpen(false);
        },
      }));

    const assistantItem: PaletteItem = {
      id: 'assistant',
      kind: 'assistant',
      title: normalizedQuery ? `Ask AI about "${query}"` : 'Ask Velora AI for help',
      subtitle: 'Open the assistant with context from your current search.',
      action: () => {
        window.dispatchEvent(
          new CustomEvent('velora:open-assistant', {
            detail: {
              prompt: normalizedQuery ? query : 'Help me find the best smart devices on Velora.',
            },
          })
        );
        setOpen(false);
      },
    };

    return [...productItems, ...categoryItems, assistantItem];
  }, [categories, navigate, products, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            className="mx-auto mt-16 w-[min(980px,calc(100%-24px))] overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface-primary)]/95 shadow-2xl"
          >
            <div className="border-b border-white/8 px-5 py-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/20 px-5 py-3.5">
                <Search className="ml-1 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, categories, or ask the assistant..."
                  className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                />
                {query && (
                  <button type="submit" className="rounded-full bg-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-emerald-400">
                    Search
                  </button>
                )}
              </form>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Velora Universe
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="flex w-full items-center gap-4 rounded-[1.5rem] border border-white/6 bg-white/[0.03] px-4 py-4 text-left transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]"
                  >
                    {item.kind === 'assistant' ? (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                        <Bot className="h-5 w-5" />
                      </div>
                    ) : (
                      <img src={item.image} alt="" className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--foreground)]">{item.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--muted-foreground)]">{item.subtitle}</p>
                    </div>
                    <span className="rounded-full border border-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      {item.kind}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
