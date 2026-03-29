import React, { useEffect, useMemo, useState } from 'react';
import {
  Globe,
  Heart,
  Languages,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sun,
  UserCircle,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CURRENCIES, useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useCommerce } from '../contexts/CommerceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

function NavLink({
  href,
  label,
  active,
}: {
  key?: React.Key;
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative rounded-full border border-transparent px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted-foreground)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.05] hover:text-[var(--foreground)]',
        active && 'border-white/10 bg-white/[0.05] text-[var(--foreground)] shadow-[0_0_24px_rgba(16,185,129,0.08)]'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#22d5ee,#10c981,#a856f7)] shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-transform duration-300 group-hover:scale-x-100',
          active && 'scale-x-100'
        )}
      />
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCommerce();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCurrencyOpen(false);
    setIsLangOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Francais' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Espanol' },
  ];

  const mainLinks = useMemo(
    () => [
      { href: '/', label: t('nav.home') },
      { href: '/products', label: t('nav.products') },
      { href: '/wishlist', label: t('nav.wishlist') },
      { href: '/orders', label: t('nav.orders') },
    ],
    [t]
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[var(--surface-primary)]/62 backdrop-blur-2xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[80px] grid-cols-[1fr_auto] items-center gap-4 py-3 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-4">
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/30 via-emerald-500/40 to-fuchsia-500/25 opacity-75 blur-xl transition-opacity group-hover:opacity-100" />
                <span className="relative font-display text-2xl font-black tracking-tighter text-[var(--foreground)] drop-shadow-[0_0_24px_rgba(16,185,129,0.22)]">
                   ⚡Nova Tech <span className="text-emerald-400">.</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 lg:flex">
            {mainLinks.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} active={location.pathname === item.href} />
            ))}
            {user?.role === 'admin' && <NavLink href="/admin/dashboard" label="Dashboard" active={location.pathname.startsWith('/admin')} />}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="relative">
              <button onClick={() => setIsLangOpen((prev) => !prev)} className="hidden items-center gap-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:flex">
                <Languages className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{language}</span>
              </button>

              {isLangOpen && (
                <div className={cn('absolute mt-2 w-36 rounded-2xl border border-white/10 bg-[var(--surface-primary)] p-2 shadow-2xl', isRTL ? 'left-0' : 'right-0')}>
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as 'en' | 'ar' | 'fr' | 'de' | 'es');
                        setIsLangOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5',
                        language === item.code ? 'text-emerald-400' : 'text-[var(--muted-foreground)]'
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setIsCurrencyOpen((prev) => !prev)} className="hidden items-center gap-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:flex">
                <Globe className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{currency.code}</span>
              </button>

              {isCurrencyOpen && (
                <div className={cn('absolute mt-2 w-32 rounded-2xl border border-white/10 bg-[var(--surface-primary)] p-2 shadow-2xl', isRTL ? 'left-0' : 'right-0')}>
                  {CURRENCIES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setCurrency(item);
                        setIsCurrencyOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5',
                        currency.code === item.code ? 'text-emerald-400' : 'text-[var(--muted-foreground)]'
                      )}
                    >
                      {item.code}
                      <span className="text-[10px] opacity-40">{item.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => window.dispatchEvent(new Event('velora:open-search'))}
              className="hidden h-10 w-[200px] items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 text-left text-[var(--muted-foreground)] transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-[var(--foreground)] xl:flex"
              aria-label="Open search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">Search...</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new Event('velora:open-search'))}
              className="rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] xl:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link to="/wishlist" className="relative rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
                {cartCount}
              </span>
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen((prev) => !prev)} className="flex items-center gap-2 border-l border-white/10 pl-2">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`} className="h-8 w-8 rounded-full border border-white/20" alt="" />
                </button>

                {isUserMenuOpen && (
                  <div className={cn('absolute mt-2 w-56 rounded-2xl border border-white/10 bg-[var(--surface-primary)] p-2 shadow-2xl', isRTL ? 'left-0' : 'right-0')}>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-[var(--muted-foreground)] transition-all hover:bg-white/5 hover:text-[var(--foreground)]"
                    >
                      <UserCircle className="h-4 w-4" />
                      {t('nav.profile')}
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-cyan-400 transition-all hover:bg-cyan-500/10"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-[var(--muted-foreground)] transition-all hover:bg-white/5 hover:text-[var(--foreground)]"
                    >
                      <Package className="h-4 w-4" />
                      {t('nav.orders')}
                    </Link>
                    <div className="my-2 h-px bg-white/10" />
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-emerald-500">
                {t('auth.login')}
              </Link>
            )}

            <button className="rounded-full p-2 text-[var(--foreground)] lg:hidden" onClick={() => setIsMenuOpen((prev) => !prev)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="space-y-4 border-t border-white/8 bg-[var(--surface-primary)] px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-3">
            {mainLinks.map((item) => (
              <Link key={item.href} to={item.href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
