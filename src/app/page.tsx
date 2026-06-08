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
      <section className="overflow-hidden rounded-[2rem] bg-stone-950 p-6 text-white shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-orange-200">June 19–27, 2026</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">Summer Solstice Sadhana</h1>
        <p className="mt-3 text-base leading-7 text-orange-50/85">Offline-first festival guide for the daily schedule, favorites, personal agenda, venues and essential info.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/program" className="rounded-2xl bg-orange-300 px-4 py-3 text-center font-bold text-stone-950">Open Program</Link>
          <Link href="/agenda" className="rounded-2xl bg-white/10 px-4 py-3 text-center font-bold text-white ring-1 ring-white/20">My Agenda</Link>
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
              <Icon className="h-6 w-6 text-orange-700" />
              <p className="mt-3 text-lg font-bold text-stone-950">{item.label}</p>
              <p className="text-sm font-semibold text-stone-500">{item.value}</p>
            </Link>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-black text-stone-950">First activities</h2>
        {todayHighlights.map((item) => (
          <Link key={item.id} href={`/program/${item.id}`} className="card block rounded-3xl p-4">
            <p className="text-sm font-bold text-orange-800">{formatDate(item.date)} · {timeRange(item.startTime, item.endTime)}</p>
            <p className="mt-1 text-lg font-bold text-stone-950">{item.title}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
