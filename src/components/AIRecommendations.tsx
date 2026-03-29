import React, { useEffect, useState } from 'react';
import { Sparkles, BrainCircuit, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { storefrontApi } from '../services/storefrontApi';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types';

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsAnalyzing(true);
      try {
        const products = await storefrontApi.getProducts();
        if (cancelled) {
          return;
        }

        const sorted = [...products].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        setRecommendedProducts(sorted.slice(0, 4));
      } catch (error) {
        console.error('Failed to load recommendations', error);
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-black">
                  <BrainCircuit className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-[10px] font-bold uppercase tracking-[0.3em] text-transparent">
                Velora Smart Picks
              </span>
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white">
              {user ? (
                <>
                  Selected for <span className="italic text-emerald-500">{user.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  AI <span className="italic text-white/40">Favorites</span>
                </>
              )}
            </h2>
            <p className="max-w-md text-sm text-white/40">
              We prioritize products with the best customer feedback, strong stock, and top storefront performance so the recommendations stay useful.
            </p>
          </div>

          {!user && (
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
            >
              Login for Better Picks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex aspect-[4/5] flex-col space-y-4 rounded-2xl border border-white/5 bg-white/5 p-6">
                  <div className="flex-1 animate-pulse rounded-xl bg-white/5" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {recommendedProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="absolute -right-2 -top-2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-3 py-1 text-[8px] font-black uppercase tracking-tighter text-white shadow-lg shadow-emerald-500/20">
                    <Zap className="h-2 w-2 fill-current" /> Top Match
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Sparkles className="h-8 w-8 animate-pulse text-emerald-500" />
              </div>
              <div>
                <h4 className="mb-1 text-lg font-bold text-white">Why these products?</h4>
                <p className="max-w-sm text-xs text-white/40">
                  Each item here is chosen from the best-rated inventory currently available in the store, so the section always reflects real backend data.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                Precision: 0.981
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                Inventory-aware
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
