import Link from "next/link";
import { BookOpen, CalendarDays, HeartPulse, Info, Leaf, MapPin, ShieldCheck, Users } from "lucide-react";
import infoPages from "@/data/info-pages.json";
import type { InfoPage } from "@/lib/types";

type InfoGroup = {
  id: string;
  title: string;
  description: string;
  icon: typeof Info;
  accent: string;
  pages: string[];
};

const pageTitles: Record<string, string> = {
  "page-5": "Meditation to Unlock the Joy",
  "page-6": "Meditation: Arm Sequence",
  "page-7": "Meditation: Timing & Closing",
  "page-8": "Keep Up Quote",
  "page-9": "Getting Around & Self Care",
  "page-10": "Hydration, Water & Badges",
  "page-11": "Climate & Tenting Areas",
  "page-12": "Showers, Toilets, Meals & Scents",
  "page-13": "Phones, Gadgets & Medical Conditions",
  "page-14": "First Aid, Photography & Video",
  "page-15": "Bazaar, Lost & Found, Leaving Camp",
  "page-16": "Shuttles & Security",
  "page-17": "Emergency Response",
  "code-of-conduct": "Code of Conduct",
  "page-21": "Youth Camp",
  "page-49": "Wake-Up Call & Hydrotherapy",
  "page-50": "Sadhana & Gurdwara",
  "page-51": "Daily Meals & Class Rhythm",
  "page-52": "Evening Programs & Lights Out",
};

const infoGroups: InfoGroup[] = [
  {
    id: "start-here",
    title: "Start here",
    description: "Orientation, getting around, climate, hydration and basic camp setup.",
    icon: MapPin,
    accent: "bg-sky-50 text-[#2f62b6] ring-sky-900/10",
    pages: ["page-9", "page-10", "page-11"],
  },
  {
    id: "health-safety",
    title: "Health & safety",
    description: "First Aid, emergency response, medical needs, phones and media boundaries.",
    icon: HeartPulse,
    accent: "bg-rose-50 text-rose-700 ring-rose-900/10",
    pages: ["page-13", "page-14", "page-17"],
  },
  {
    id: "camp-life",
    title: "Camp life logistics",
    description: "Meals, showers, toilets, bazaar, lost & found, shuttles and security.",
    icon: Leaf,
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-900/10",
    pages: ["page-12", "page-15", "page-16"],
  },
  {
    id: "rules",
    title: "Community agreements",
    description: "The full Code of Conduct from PDF pages 18–20, cleaned for offline reading.",
    icon: ShieldCheck,
    accent: "bg-amber-50 text-[#9a5a00] ring-amber-900/10",
    pages: ["code-of-conduct"],
  },
  {
    id: "daily-rhythm",
    title: "Daily rhythm",
    description: "Wake-up call, hydrotherapy, Sadhana, meals, classes and evening programs.",
    icon: CalendarDays,
    accent: "bg-orange-50 text-[#f39200] ring-orange-900/10",
    pages: ["page-49", "page-50", "page-51", "page-52"],
  },
  {
    id: "practice",
    title: "Practice & inspiration",
    description: "Solstice meditation instructions and inspirational opening pages.",
    icon: BookOpen,
    accent: "bg-indigo-50 text-indigo-700 ring-indigo-900/10",
    pages: ["page-5", "page-6", "page-7", "page-8"],
  },
  {
    id: "families",
    title: "Families",
    description: "Youth Camp information for parents and children.",
    icon: Users,
    accent: "bg-cyan-50 text-cyan-700 ring-cyan-900/10",
    pages: ["page-21"],
  },
];

const pagesById = new Map((infoPages as InfoPage[]).map((page) => [page.id, page]));

function paragraphsFor(page: InfoPage) {
  return page.content
    .replace(/\u00ad/g, "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\n/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .filter((paragraph) => paragraph !== page.title && paragraph !== pageTitles[page.id]);
}

function sourceLabel(page: InfoPage) {
  if (page.id === "code-of-conduct") return "PDF pages 18–20";
  return page.sourcePage ? `PDF page ${page.sourcePage}` : "PDF excerpt";
}

export default function InfoPage() {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#2f62b6] p-5 text-white shadow-xl">
        <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-[#f39200]/25 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-100">Offline info</p>
          <h1 className="mt-2 text-4xl font-black leading-none">Info Hub</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50/90">
            Información esencial del programa agrupada por tipo para encontrar rápido lo que necesitas durante el festival, incluso offline.
          </p>
        </div>
      </section>

      <section aria-label="Info categories" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {infoGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Link key={group.id} href={`#${group.id}`} className={`rounded-3xl p-4 ring-1 ${group.accent}`}>
              <Icon className="h-6 w-6" />
              <p className="mt-3 text-sm font-black leading-tight">{group.title}</p>
              <p className="mt-1 text-xs font-semibold opacity-75">{group.pages.length} {group.pages.length === 1 ? "item" : "items"}</p>
            </Link>
          );
        })}
      </section>

      <section className="space-y-5">
        {infoGroups.map((group) => {
          const Icon = group.icon;
          const groupPages = group.pages.map((id) => pagesById.get(id)).filter((page): page is InfoPage => Boolean(page));

          return (
            <section key={group.id} id={group.id} className="scroll-mt-20 space-y-3">
              <div className="flex items-start gap-3 px-1">
                <div className={`rounded-2xl p-3 ring-1 ${group.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#2f62b6]">{group.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {groupPages.map((page, index) => {
                  const isFeatured = page.id === "code-of-conduct" || page.id === "page-17";
                  return (
                    <details key={page.id} open={index === 0 && group.id === "rules"} className={`card group rounded-3xl p-4 ${isFeatured ? "ring-2 ring-[#f39200]/20" : ""}`}>
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                        <span>
                          <span className="block text-lg font-black leading-snug text-slate-950">{pageTitles[page.id] ?? page.title}</span>
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{sourceLabel(page)}</span>
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 group-open:bg-[#2f62b6] group-open:text-white">Open</span>
                      </summary>

                      <div className="mt-4 space-y-4 border-t border-sky-900/10 pt-4">
                        {paragraphsFor(page).map((paragraph) => (
                          <p key={paragraph.slice(0, 80)} className="text-sm leading-7 text-slate-700">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <p className="rounded-3xl bg-sky-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-sky-900/10">
        Tip: abre las secciones importantes una vez con conexión. La PWA guarda esta información para consultarla sin señal después de instalarla en la pantalla de inicio.
      </p>
    </div>
  );
}
