import { FormEvent, useState } from 'react';
import { Mail, MapPin, MessageSquareMore, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { usePageTitle } from '../hooks/usePageTitle';

export default function ContactPage() {
  usePageTitle('Contact Us');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    toast.success('Message sent in demo mode');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.5rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400">Contact Us</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Talk to the Velora team.</h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60">
            Reach out for support, partnerships, order questions, or product guidance. The page is local-demo ready and no longer falls into a broken route.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { icon: Mail, title: 'Email', value: 'support@velora.com' },
              { icon: Phone, title: 'Phone', value: '+1 (800) VELORA-TECH' },
              { icon: MapPin, title: 'Address', value: 'Global HQ, Silicon Valley' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <div className="rounded-2xl bg-emerald-500/10 p-3">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">{item.title}</p>
                  <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-white/8 bg-white/[0.04] p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3">
              <MessageSquareMore className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send a message</h2>
              <p className="mt-1 text-sm text-white/50">Fast local demo form for now.</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Full name"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email address"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
            <textarea
              value={formData.message}
              onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="How can we help?"
              className="min-h-44 w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <button type="submit" className="mt-6 rounded-full bg-emerald-500 px-8 py-4 text-sm font-bold text-black transition-colors hover:bg-emerald-400">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
