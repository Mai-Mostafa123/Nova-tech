import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

const SLIDES = [
  {
    id: 1,
    title: 'Future of Tech',
    subtitle: 'Starts Here.',
    description: 'Experience the next generation of premium electronics, gaming gear, and smart home innovations.',
    image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    accent: 'emerald',
  },
  {
    id: 2,
    title: 'Ultimate products',
    subtitle: 'Redefined.',
    description: 'Unleash your potential with professional-grade peripherals and high-performance hardware.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    accent: 'violet',
  },
  {
    id: 3,
    title: 'Smart Living',
    subtitle: 'Simplified.',
    description: 'Transform your home into a futuristic sanctuary with our curated smart ecosystem.',
    image: 'https://unsplash.com/photos/black-wirelhttps://plus.unsplash.com/premium_photo-1679513691474-73102089c117?q=80&w=1113&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dess-headphones-between-apple-keyboard-and-apple-magic-mouse-on-white-surface-YDZPdqv3FcA',
    accent: 'blue',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div ref={containerRef} className="relative h-[88vh] min-h-[700px] w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.div style={{ y }} className="absolute inset-0">
            <img src={SLIDES[currentSlide].image} alt="" className="h-full w-full scale-110 object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-black/55" />
          </motion.div>

          <motion.div style={{ opacity }} className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-center px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-8 flex items-center gap-2"
              >
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em]',
                    SLIDES[currentSlide].accent === 'emerald'
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
                      : SLIDES[currentSlide].accent === 'violet'
                        ? 'border-violet-500/20 bg-violet-500/5 text-violet-500'
                        : 'border-blue-500/20 bg-blue-500/5 text-blue-500'
                  )}
                >
                  <Sparkles className="h-3 w-3 animate-pulse" /> {t('home.featured')}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-5xl font-black leading-[0.85] tracking-tighter text-white sm:text-7xl xl:text-9xl"
              >
                {SLIDES[currentSlide].title}
                <br />
                <span
                  className={cn(
                    'text-glow italic',
                    SLIDES[currentSlide].accent === 'emerald'
                      ? 'text-emerald-500'
                      : SLIDES[currentSlide].accent === 'violet'
                        ? 'text-violet-500'
                        : 'text-blue-500'
                  )}
                >
                  {SLIDES[currentSlide].subtitle}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-8 max-w-2xl text-base font-light leading-relaxed text-white/60 sm:text-xl"
              >
                {SLIDES[currentSlide].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8"
              >
                <button
                  onClick={() => navigate('/products')}
                  className={cn(
                    'group relative flex items-center gap-4 overflow-hidden rounded-full px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all',
                    SLIDES[currentSlide].accent === 'emerald'
                      ? 'bg-emerald-500 shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400'
                      : SLIDES[currentSlide].accent === 'violet'
                        ? 'bg-violet-500 shadow-2xl shadow-violet-500/20 hover:bg-violet-400'
                        : 'bg-blue-500 shadow-2xl shadow-blue-500/20 hover:bg-blue-400'
                  )}
                >
                  <span className="relative z-10">Shop Now</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                </button>

                <Link to="/products?featured=true" className="border-b border-white/10 pb-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 transition-all hover:border-white hover:text-white">
                  View Collections
                </Link>
              </motion.div>

              <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: 'Live inventory', value: 'Stock synced' },
                  { label: 'Quick checkout', value: 'Cart + orders' },
                  { label: 'Role-based access', value: 'Admin + customer' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-black/25 px-5 py-4 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                    <p className="mt-2 text-sm font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-4 sm:bottom-16 sm:right-16 sm:gap-6">
        <div className="flex items-center gap-4">
          <button onClick={prevSlide} className="group rounded-full border border-white/10 bg-white/5 p-4 text-white transition-all hover:bg-white hover:text-black">
            <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button onClick={nextSlide} className="group rounded-full border border-white/10 bg-white/5 p-4 text-white transition-all hover:bg-white hover:text-black">
            <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="relative hidden h-px w-24 bg-white/10 sm:block">
          <motion.div
            className="absolute inset-y-0 left-0 bg-emerald-500"
            animate={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
          0{currentSlide + 1} / 0{SLIDES.length}
        </div>
      </div>

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
