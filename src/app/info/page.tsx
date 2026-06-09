import { AppLink as Link } from "@/components/app-link";
import { BookOpen, CalendarDays, ChevronDown, HeartPulse, Info, Leaf, MapPin, ShieldCheck, Users } from "lucide-react";
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

type InfoSection = {
  title?: string;
  paragraphs: string[];
  bullets: string[];
  numbered: string[];
  definitions: { label: string; value: string }[];
  quotes: string[];
};

const pageTitles: Record<string, string> = {
  "page-5": "Meditation to unlock the joy!",
  "page-8": "Keep Up Quote",
  "page-9": "Stuff You Need to Know",
  "page-12": "Showers, Toilets, Meals & Scents",
  "page-13": "Phones, Gadgets & Medical Conditions",
  "page-14": "First Aid, Photography & Video",
  "page-15": "Bazaar, Lost & Found, Leaving Camp",
  "page-16": "Security at Solstice",
  "page-17": "Emergency Response",
  "code-of-conduct": "Code of Conduct",
  "page-21": "Youth Camp",
  "page-49": "Wake-Up Call & Hydrotherapy",
  "page-50": "Sadhana & Gurdwara",
  "page-51": "Daily Meals & Class Rhythm",
  "page-52": "Evening Programs & Lights Out",
};

const sectionHeadings = new Set([
  "Getting around",
  "Taking Care of Yourself",
  "Watch out for Dehydration",
  "Name Badges and Wristbands",
  "Climate",
  "Showers and Toilets",
  "Tenting Areas",
  "Hand Washing",
  "Meals",
  "Please Refrain from Using Scented Products",
  "Take a Break from Your Cell Phones & Gadgets",
  "Medical Conditions",
  "First Aid",
  "Photography and Videography at Solstice",
  "Personal photography and video are allowed at Solstice, with the following rules:",
  "Bazaar",
  "Bazaar Hours (may be changed at 3HO’s discretion):",
  "Lost and Found",
  "Leaving Camp",
  "Security at Solstice",
  "In Case of Emergency",
  "Youth Camp",
  "Wake-Up Call",
  "Hydrotherapy",
  "Sadhana",
  "Gurdwara",
  "Breakfast",
  "Karma Yoga and Service Exchange Team Gatherings",
  "Morning Classes",
  "Lunch",
  "Afternoon Classes",
  "Dinner",
  "Evening Programs",
  "Lights Out & Camp Quiet",
  "Code of Conduct",
]);

const definitionLabels = new Set(["Posture", "Mantra", "Meaning of the Mantra", "Breath", "Mudra", "Eye Focus", "Time", "End", "Comments", "Directions"]);

const infoGroups: InfoGroup[] = [
  {
    id: "start-here",
    title: "Start Here",
    description: "Orientation, getting around, climate, hydration and basic camp setup.",
    icon: MapPin,
    accent: "bg-sky-50 text-[#2f62b6] ring-sky-900/10",
    pages: ["page-9"],
  },
  {
    id: "health-safety",
    title: "Health & Safety",
    description: "First Aid, emergency response, medical needs, phones and media boundaries.",
    icon: HeartPulse,
    accent: "bg-rose-50 text-rose-700 ring-rose-900/10",
    pages: ["page-13", "page-14", "page-17"],
  },
  {
    id: "camp-life",
    title: "Camp Life",
    description: "Meals, showers, toilets, bazaar, lost & found, leaving camp and security.",
    icon: Leaf,
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-900/10",
    pages: ["page-12", "page-15", "page-16"],
  },
  {
    id: "rules",
    title: "Community Agreements",
    description: "The full Code of Conduct, cleaned for offline reading.",
    icon: ShieldCheck,
    accent: "bg-amber-50 text-[#9a5a00] ring-amber-900/10",
    pages: ["code-of-conduct"],
  },
  {
    id: "daily-rhythm",
    title: "Daily Rhythm",
    description: "Wake-up call, hydrotherapy, Sadhana, meals, classes and evening programs.",
    icon: CalendarDays,
    accent: "bg-orange-50 text-[#f39200] ring-orange-900/10",
    pages: ["page-49", "page-50", "page-51", "page-52"],
  },
  {
    id: "practice",
    title: "Practice & Inspiration",
    description: "Solstice meditation instructions and inspirational opening pages.",
    icon: BookOpen,
    accent: "bg-indigo-50 text-indigo-700 ring-indigo-900/10",
    pages: ["page-5", "page-8"],
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

function cleanText(value: string) {
  return value
    .replace(/\u00ad/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\byour self\b/g, "yourself")
    .replace(/\bPlea se\b/g, "Please")
    .replace(/\bimportan ce\b/g, "importance")
    .replace(/\bdehy dration\b/g, "dehydration")
    .replace(/\bdehy ration\b/g, "dehydration")
    .replace(/\bphy sical\b/g, "physical")
    .replace(/\bex traordinary\b/g, "extraordinary")
    .replace(/\btemperatu res\b/g, "temperatures")
    .replace(/\bBe cause\b/g, "Because")
    .replace(/\bwa ter\b/g, "water")
    .replace(/\bme dications\b/g, "medications")
    .replace(/\bdu ring\b/g, "during")
    .replace(/\bemergen cy\b/g, "emergency")
    .replace(/\bpermi tted\b/g, "permitted")
    .replace(/\bsensi tive\b/g, "sensitive")
    .replace(/\bSolsti ce\b/g, "Solstice")
    .trim();
}

function normalizeLines(page: InfoPage) {
  return page.content
    .replace(/\u00ad/g, "")
    .split(/\n+/g)
    .map(cleanText)
    .filter(Boolean)
    .filter((line) => (page.id === "page-16" || (line !== page.title && line !== pageTitles[page.id])) && line !== "Stuff You Need to Know" && line !== "Daily Activites" && line !== "Daily Activities");
}

function createSection(title?: string): InfoSection {
  return { title, paragraphs: [], bullets: [], numbered: [], definitions: [], quotes: [] };
}

function pushParagraph(section: InfoSection, buffer: string[]) {
  if (!buffer.length) return;
  section.paragraphs.push(cleanText(buffer.join(" ")));
  buffer.length = 0;
}

function isSectionHeading(line: string) {
  return sectionHeadings.has(line);
}

function sectionsFor(page: InfoPage) {
  const lines = normalizeLines(page);
  const sections: InfoSection[] = [];
  let current = createSection();
  const paragraphBuffer: string[] = [];

  const commitSection = () => {
    pushParagraph(current, paragraphBuffer);
    if (current.title || current.paragraphs.length || current.bullets.length || current.numbered.length || current.definitions.length || current.quotes.length) {
      sections.push(current);
    }
  };

  for (const line of lines) {
    if (isSectionHeading(line)) {
      commitSection();
      current = createSection(line.replace(/:$/, ""));
      continue;
    }

    if (/^[∙•—-]\s*/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      current.bullets.push(cleanText(line.replace(/^[∙•—-]\s*/, "")));
      continue;
    }

    if (/^\d+\.\s*/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      current.numbered.push(cleanText(line.replace(/^\d+\.\s*/, "")));
      continue;
    }

    const definitionMatch = line.match(/^([^:]{3,36}):\s+(.+)$/);
    if (definitionMatch && definitionLabels.has(definitionMatch[1])) {
      pushParagraph(current, paragraphBuffer);
      current.definitions.push({ label: definitionMatch[1], value: cleanText(definitionMatch[2]) });
      continue;
    }

    if (/^[“\"]/.test(line) || /Yogi Bhajan/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      current.quotes.push(line);
      continue;
    }

    paragraphBuffer.push(line);
  }

  commitSection();
  return sections;
}

function SectionCard({ section }: { section: InfoSection }) {
  const hasStructuredLists = section.bullets.length || section.numbered.length || section.definitions.length;

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-sky-900/10 bg-white shadow-sm">
      {section.title ? (
        <div className="bg-gradient-to-r from-sky-50 to-orange-50 px-4 py-3">
          <h3 className="text-lg font-black leading-tight text-[#2f62b6]">{section.title}</h3>
        </div>
      ) : null}

      <div className="space-y-4 p-4">
        {section.quotes.map((quote) => (
          <blockquote key={quote.slice(0, 90)} className="rounded-2xl border-l-4 border-[#f39200] bg-orange-50 px-4 py-3 text-base font-semibold leading-7 text-slate-800">
            {quote}
          </blockquote>
        ))}

        {section.paragraphs.map((paragraph, paragraphIndex) => (
          <p key={paragraph.slice(0, 90)} className={`${paragraphIndex === 0 && !section.title && !hasStructuredLists ? "rounded-2xl bg-sky-50 p-4 font-semibold text-[#2f62b6]" : "text-slate-700"} text-sm leading-7`}>
            {paragraph}
          </p>
        ))}

        {section.definitions.length ? (
          <dl className="grid gap-3">
            {section.definitions.map((definition) => (
              <div key={definition.label} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-900/5">
                <dt className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{definition.label}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-700">{definition.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {section.numbered.length ? (
          <ol className="space-y-3">
            {section.numbered.map((item, itemIndex) => (
              <li key={item.slice(0, 90)} className="flex gap-3 rounded-2xl bg-indigo-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-indigo-900/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">{itemIndex + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {section.bullets.length ? (
          <ul className="space-y-2">
            {section.bullets.map((item) => (
              <li key={item.slice(0, 90)} className="flex gap-3 rounded-2xl bg-emerald-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-emerald-900/5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
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
            Essential program information grouped by topic so you can quickly find what you need during the festival, even offline.
          </p>
        </div>
      </section>

      <section aria-label="Info categories" className="grid grid-cols-2 gap-3">
        {infoGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Link key={group.id} href={`#${group.id}`} className={`rounded-3xl p-4 shadow-sm ring-1 ${group.accent}`}>
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
                  const sections = sectionsFor(page);
                  return (
                    <details key={page.id} open={index === 0 && group.id === "rules"} className={`card group rounded-[1.75rem] p-4 ${isFeatured ? "ring-2 ring-[#f39200]/20" : ""}`}>
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                        <span>
                          <span className="block text-lg font-black leading-snug text-slate-950">{pageTitles[page.id] ?? page.title}</span>
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 group-open:bg-[#2f62b6] group-open:text-white">
                          Open <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
                        </span>
                      </summary>

                      <div className="mt-4 border-t border-sky-900/10 pt-4">
                        <div className="space-y-3">
                          {sections.map((section, sectionIndex) => (
                            <SectionCard key={`${page.id}-${section.title ?? sectionIndex}`} section={section} />
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <p className="rounded-3xl bg-sky-50 p-4 text-sm font-semibold leading-6 text-slate-700 ring-1 ring-sky-900/10">
        Open sections while online — PWA caches them for offline reading.
      </p>
    </div>
  );
}
