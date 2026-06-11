import { MapViewer } from "./map-viewer";
import { CheckCircle, MapPin } from "lucide-react";

export default function MapPage() {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-sky-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(47,98,182,0.08)]">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ffd66b]/35 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Camp Map</p>
            <h1 className="mt-1 text-4xl font-black tracking-[-0.055em] text-[#2f62b6]">Venues</h1>
            <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-600">
              Ram Das Puri venues, services, and gathering areas.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-xs font-black text-[#2f62b6] ring-1 ring-sky-900/10 sm:inline-flex">
            <CheckCircle className="h-4 w-4" />
            Offline ready
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-[#9a5a00] ring-1 ring-[#f39200]/20">
            <MapPin className="h-3.5 w-3.5" />
            Ram Das Puri
          </span>
          <span className="inline-flex min-h-9 items-center rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-[#2f62b6] ring-1 ring-sky-900/10">
            Venues and services
          </span>
        </div>
      </section>
      <MapViewer />
    </div>
  );
}
