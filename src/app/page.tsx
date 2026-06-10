import { AppLink as Link } from "@/components/app-link";
import { CalendarDays, Heart, Info, Map } from "lucide-react";
import { InstallHint } from "@/components/install-hint";

const navItems = [
  { href: "/program", label: "Program", icon: CalendarDays, value: "Full schedule" },
  { href: "/favorites", label: "Favorites", icon: Heart, value: "Saved sessions" },
  { href: "/info", label: "Info", icon: Info, value: "Camp guide" },
  { href: "/map", label: "Map", icon: Map, value: "Venues & map" },
];

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="relative -mx-1 overflow-hidden rounded-2xl bg-[#1d3f94] px-6 pb-7 pt-8 shadow-[0_24px_64px_rgba(18,51,130,0.30)] sm:mx-0 sm:px-8">
        {/* Decorative blurs */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-60 w-60 rounded-full bg-[#f39200]/12 blur-3xl" />
        <div className="premium-pass-hero absolute inset-0 pointer-events-none" />

        <div className="relative space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f39200]">3HO</span>
            <span className="h-3 w-px bg-white/25" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">June 19–27, 2026</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="solstice-title text-[3.75rem] font-black uppercase leading-[0.87] tracking-tight text-white sm:text-7xl">
              Summer<br />Solstice
            </h1>
            <p className="mt-2 text-[2rem] font-black uppercase tracking-wider text-[#f39200] sm:text-5xl">
              Sadhana
            </p>
            <p className="mt-4 text-lg font-semibold text-white/70">
              Chardi Kala · A Celebration of Joy
            </p>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/program" className="rounded-2xl bg-white px-4 py-3.5 text-center text-sm font-black text-[#1d3f94] shadow-[0_8px_20px_rgba(0,0,0,0.15)]">Open Program</Link>
            <Link href="/info" className="rounded-2xl border border-white/25 bg-white/12 px-4 py-3.5 text-center text-sm font-black text-white">Info Hub</Link>
          </div>
        </div>
      </section>

      <InstallHint />

      <section className="grid grid-cols-2 gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="quick-tile group rounded-2xl p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#2f62b6] shadow-sm ring-1 ring-sky-100 transition group-hover:scale-105">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-lg font-black text-slate-950">{item.label}</p>
              <p className="text-sm font-semibold capitalize text-slate-500">{item.value}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
