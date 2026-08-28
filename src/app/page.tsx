import { AppLink as Link } from "@/components/app-link";
import { WOMENS_RENEWAL_PATH } from "@/lib/womens-renewal";
import { ArrowRight, CalendarDays, GraduationCap, Heart, Info, Map, MessageCircle, Sparkles, UserRound } from "lucide-react";
import { InstallHint } from "@/components/install-hint";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { EventSwitcher } from "@/components/event-switcher";
import { MenusTile } from "@/components/menus-tile";

const navItems = [
  { href: "/program", label: "Program", icon: CalendarDays, value: "Full schedule" },
  { href: "/teachers", label: "Teachers", icon: GraduationCap, value: "Bios & sessions" },
  { href: "/favorites", label: "Favorites", icon: Heart, value: "Saved sessions" },
  { href: "/info", label: "Info", icon: Info, value: "Camp guide" },
  { href: "/map", label: "Map", icon: Map, value: "Venues & map" },
  { href: "/contact", label: "Contact", icon: MessageCircle, value: "Help & messages" },
  { href: "/account", label: "Account", icon: UserRound, value: "Sync favorites" },
];

export default function Home() {
  return (
    <div className="space-y-4">
      <ActiveEventBanner />
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

      <EventSwitcher />

      <section className="overflow-hidden rounded-2xl border border-[#f39200]/25 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.11)]">
        <div className="grid min-h-44 grid-cols-[minmax(0,1fr)_7.25rem] sm:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[#f39200]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">After Solstice</p>
            </div>
            <h2 className="mt-2 text-2xl font-black leading-[1.02] tracking-[-0.04em] text-[#2f62b6] sm:text-3xl">
              A Woman&apos;s Renewal Experience
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              June 29-July 1. Save the details offline and register when you are online.
            </p>
            <Link
              href={WOMENS_RENEWAL_PATH}
              className="mt-3 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#2f62b6] px-4 py-2.5 text-sm font-black text-white"
            >
              Open Renewal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/womens-renewal/circle.jpg"
              alt="Women meditating after Summer Solstice"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/18 to-transparent sm:from-white/72" />
          </div>
        </div>
      </section>

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
        <MenusTile />
      </section>
    </div>
  );
}
