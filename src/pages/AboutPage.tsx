import { Cpu, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const pillars = [
  {
    title: 'Future-first storefront',
    text: 'Velora is built to make smart devices feel connected, discoverable, and premium from the first scroll.',
    icon: Sparkles,
  },
  {
    title: 'Trusted commerce flow',
    text: 'Authentication, orders, dashboards, wishlist, and cart all run on one backend source of truth.',
    icon: ShieldCheck,
  },
  {
    title: 'Tech-native design',
    text: 'We shape every screen to feel like a smart tech universe, not a crowded generic catalog.',
    icon: Cpu,
  },
  {
    title: 'Global shopping mindset',
    text: 'The experience is responsive, role-aware, and ready to scale across categories, devices, and teams.',
    icon: Globe2,
  },
];

export default function AboutPage() {
  usePageTitle('About Us');

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 sm:p-10 lg:p-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400">About Velora</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">
          A premium commerce universe for smart devices, immersive tech, and connected living.
        </h1>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
          Velora blends product discovery, rich storefront interactions, and role-based commerce workflows into one modern shopping experience.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-6">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3">
              <pillar.icon className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{pillar.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
