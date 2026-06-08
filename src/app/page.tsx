import Link from "next/link";
import { CalendarDays, Heart, Info, Map, Star } from "lucide-react";
import program from "@/data/program.json";
import { InstallHint } from "@/components/install-hint";
import type { Activity } from "@/lib/types";
import { formatDate, timeRange } from "@/lib/utils";

const activities = program as Activity[];
const todayHighlights = activities.slice(0, 5);

export default function Home() {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#2f62b6] p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/images/solstice-cover-top.jpg')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/75 via-white/50 to-[#2f62b6]/90" />
        <div className="absolute -right-16 top-12 h-48 w-48 rounded-full bg-white/25 blur-3xl" />
        <div className="relative min-h-[18rem] pt-10">
          <p className="solstice-kicker text-sm font-bold uppercase text-[#f39200] drop-shadow-sm">June 19–27, 2026</p>
          <h1 className="solstice-title mt-3 text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl">Summer Solstice</h1>
          <p className="mt-1 text-4xl font-black uppercase leading-none tracking-tight text-[#2f62b6] drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] sm:text-5xl">Sadhana</p>
          <p className="mt-4 text-lg font-semibold text-[#2f62b6] drop-shadow-[0_1px_8px_rgba(255,255,255,0.9)]">Chardi Kala: A Celebration of Joy</p>
          <div className="sun-pill mt-5 inline-flex rounded-none px-5 py-3 text-xl font-bold uppercase tracking-[0.12em] text-white">June 19–27</div>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <Link href="/program" className="rounded-2xl bg-white px-4 py-3 text-center font-bold text-[#2f62b6] shadow-lg">Open Program</Link>
          <Link href="/agenda" className="rounded-2xl bg-white/15 px-4 py-3 text-center font-bold text-white ring-1 ring-white/40 backdrop-blur">My Agenda</Link>
        </div>
      </section>

      <InstallHint />

      <section className="grid grid-cols-2 gap-3">
        {[
          { href: "/program", label: "Program", icon: CalendarDays, value: `${activities.length} items` },
          { href: "/agenda", label: "My Agenda", icon: Star, value: "local" },
          { href: "/favorites", label: "Favorites", icon: Heart, value: "local" },
          { href: "/info", label: "Info", icon: Info, value: "PDF pages" },
          { href: "/map", label: "Map", icon: Map, value: "venues" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="card rounded-3xl p-4">
              <Icon className="h-6 w-6 text-[#2f62b6]" />
              <p className="mt-3 text-lg font-bold text-slate-900">{item.label}</p>
              <p className="text-sm font-semibold text-slate-500">{item.value}</p>
            </Link>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-black text-[#2f62b6]">First activities</h2>
        {todayHighlights.map((item) => (
          <Link key={item.id} href={`/program/${item.id}`} className="card block rounded-3xl p-4">
            <p className="text-sm font-bold text-[#f39200]">{formatDate(item.date)} · {timeRange(item.startTime, item.endTime)}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{item.title}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
