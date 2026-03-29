import { Mail, Twitter, Instagram, Facebook, MapPin, Phone, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export default function Footer() {
  const { isRTL } = useLanguage();

  return (
    <footer className="border-t border-white/5 bg-black pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white font-display">
              Nova Tech<span className="text-velora-emerald text-glow">.</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/40">
              The world&apos;s most advanced technology marketplace. Curating the future of electronics, gaming, and smart living.
            </p>
            <div className="flex items-center gap-4">
              <Facebook className="h-5 w-5 cursor-pointer text-white/40 transition-colors hover:text-velora-emerald" />
              <Instagram className="h-5 w-5 cursor-pointer text-white/40 transition-colors hover:text-velora-emerald" />
              <Twitter className="h-5 w-5 cursor-pointer text-white/40 transition-colors hover:text-velora-emerald" />
              <MessageCircle className="h-5 w-5 cursor-pointer text-white/40 transition-colors hover:text-velora-emerald" />
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Explore</h3>
            <ul className="space-y-4">
              <li><Link to="/category/electronics" className="text-sm text-white/40 transition-colors hover:text-velora-emerald">Electronics</Link></li>
              <li><Link to="/category/gaming" className="text-sm text-white/40 transition-colors hover:text-velora-emerald">Gaming</Link></li>
              <li><Link to="/about" className="text-sm text-white/40 transition-colors hover:text-velora-emerald">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-white/40 transition-colors hover:text-velora-emerald">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Support & Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-white/40">
                <MapPin className="h-4 w-4 text-velora-emerald" />
                Global HQ, Silicon Valley
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Phone className="h-4 w-4 text-velora-emerald" />
                +1 (800) Nova-TECH
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Mail className="h-4 w-4 text-velora-emerald" />
                support@⚡Nova.com
              </li>
              <li><Link to="/contact" className="text-sm text-white/40 transition-colors hover:text-velora-emerald">Support Request</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">Stay Updated</h3>
            <p className="mb-4 text-sm text-white/40">Subscribe to get the latest tech launches and exclusive deals.</p>
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white transition-all focus:border-velora-emerald focus:outline-none"
              />
              <button
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 rounded-full bg-velora-emerald p-2 text-black transition-colors hover:bg-velora-emerald/80',
                  isRTL ? 'left-2' : 'right-2'
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-10 md:flex-row">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            © 2026 Nova Global. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              <ShieldCheck className="h-4 w-4" /> Secure Payments
            </div>
            <div className="flex items-center gap-4 grayscale opacity-30">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
