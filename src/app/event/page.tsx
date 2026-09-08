import { AppLink as Link } from "@/components/app-link";
import { CalendarDays, ChevronLeft, GraduationCap, Heart, Info, Map, MessageCircle, UserRound } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { EventHero } from "@/components/event-hero";
import { MenusTile } from "@/components/menus-tile";
import { BuiltinOnly } from "@/components/builtin-only";
import { LandingTile } from "@/components/landing-tile";
import { BUILTIN_EVENT_SLUG } from "@/lib/builtin-event";
import { builtinLandings, landingsForEvent } from "@/lib/landings";
import { ACCOUNT_SIGN_IN_ENABLED } from "@/lib/features";

/**
 * Event home — the front door of ONE event: its hero (built-in artwork, or the
 * active synced event's name/dates/location), then the event's sections. The
 * app's Home (/) sits before this screen and lists every event; opening one
 * there lands here. Static export: the built-in content is server-rendered
 * and the synced-event variant hydrates in through the client gates.
 */

const navItems = [
  { href: "/program", label: "Program", icon: CalendarDays, value: "Full schedule" },
  { href: "/teachers", label: "Teachers", icon: GraduationCap, value: "Bios & sessions" },
  { href: "/favorites", label: "Favorites", icon: Heart, value: "Saved sessions" },
  { href: "/info", label: "Info", icon: Info, value: "Camp guide" },
  { href: "/map", label: "Map", icon: Map, value: "Venues & map" },
  { href: "/contact", label: "Contact", icon: MessageCircle, value: "Help & messages" },
  { href: "/account", label: "Account", icon: UserRound, value: "Sync favorites" },
  // The Account tile only makes sense while a visitor can actually sign in.
].filter((item) => ACCOUNT_SIGN_IN_ENABLED || item.href !== "/account");

export default function EventHomePage() {
  return (
    <div className="space-y-4">
      <ActiveEventBanner />
      <BuiltinOnly>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]">
          <ChevronLeft className="h-4 w-4" />
          All events
        </Link>
      </BuiltinOnly>

      <EventHero>
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
      </EventHero>

      <BuiltinOnly>
        {landingsForEvent(builtinLandings, BUILTIN_EVENT_SLUG).map((landing) => (
          <LandingTile key={landing.id} landing={landing} />
        ))}
      </BuiltinOnly>

      <section className="grid grid-cols-2 gap-3" aria-label="Event sections">
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
