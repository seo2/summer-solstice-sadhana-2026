import { AppLink as Link } from "@/components/app-link";
import { CalendarDays, Heart, Info, Map } from "lucide-react";
import program from "@/data/program.json";
import { InstallHint } from "@/components/install-hint";
import type { Activity } from "@/lib/types";

const activities = program as Activity[];

const navItems = [
  { href: "/program", label: "Program", icon: CalendarDays, value: `${activities.length} items` },
  { href: "/favorites", label: "Favorites", icon: Heart, value: "save practices" },
  { href: "/info", label: "Info", icon: Info, value: "camp guide" },
  { href: "/map", label: "Map", icon: Map, value: "venues" },
];

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="premium-pass-hero relative -mx-1 overflow-hidden rounded-2xl bg-[#2f62b6] px-5 pb-5 pt-7 text-white shadow-[0_28px_80px_rgba(47,98,182,0.30)] sm:mx-0 sm:px-7 sm:pt-8">
        <div className="solstice-hero-cover absolute inset-0 opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/75 via-white/50 to-[#2f62b6]/90" />
        <div className="absolute -right-14 -top-12 h-52 w-52 rounded-full bg-white/45 blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-[#f39200]/25 blur-3xl" />
        <div className="absolute inset-x-6 top-5 h-px bg-white/35" />

        <div className="relative flex min-h-[280px] flex-col justify-between">
          <div>
            <p className="solstice-kicker text-xs font-black uppercase text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)] sm:text-sm">June 19–27, 2026</p>
            <h1 className="solstice-title mt-3 max-w-[9ch] text-5xl font-black uppercase leading-[0.86] text-white sm:text-6xl">Summer Solstice</h1>
            <p className="mt-1 text-4xl font-black uppercase leading-none tracking-tight text-[#2f62b6] drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)] sm:text-5xl">Sadhana</p>
            <p className="mt-4 max-w-[18rem] text-base font-semibold leading-6 text-[#1d4f9d] drop-shadow-[0_1px_10px_rgba(255,255,255,0.95)] sm:text-lg">Chardi Kala: A Celebration of Joy</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/program" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-[#2f62b6] shadow-[0_14px_30px_rgba(15,23,42,0.18)] sm:text-base">Open Program</Link>
            <Link href="/info" className="rounded-2xl bg-white/15 px-4 py-3 text-center text-sm font-black text-white shadow-lg ring-1 ring-white/40 backdrop-blur-md sm:text-base">Info Hub</Link>
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
