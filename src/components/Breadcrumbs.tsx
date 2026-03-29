import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const LABELS: Record<string, string> = {
  products: 'Products',
  product: 'Product',
  category: 'Category',
  login: 'Account',
  profile: 'Profile',
  cart: 'Cart',
  about: 'About Us',
  contact: 'Contact Us',
  wishlist: 'Wishlist',
  orders: 'Orders',
  admin: 'Admin',
  dashboard: 'Dashboard',
  vendor: 'Vendor',
};

function formatSegment(segment: string) {
  return LABELS[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-white/6 bg-[var(--surface-secondary)]/60 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--muted-foreground)] sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 transition-colors hover:text-[var(--foreground)]">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;

          return (
            <span key={href} className="inline-flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5" />
              {isLast ? (
                <span className="text-[var(--foreground)]">{formatSegment(segment)}</span>
              ) : (
                <Link to={href} className="transition-colors hover:text-[var(--foreground)]">
                  {formatSegment(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
