import { Fragment } from "react";
import { AppLink as Link } from "@/components/app-link";
import { BookOpen, CalendarDays, ChevronDown, ChevronRight, Flame, HeartPulse, HelpCircle, Info, Leaf, MapPin, ShieldCheck, Smartphone, Users, Utensils } from "lucide-react";
import {
  groupInfoPages,
  isFeaturedPage,
  pageDisplayTitle,
  sectionsFor,
  type ContentItem,
  type InfoHubPage,
  type InfoSection,
} from "@/lib/info-content";

/**
 * The Info Hub body — topic grid, group headers, collapsible page cards and
 * section cards — shared by the built-in event and synced events. No hooks,
 * so it renders from server and client components alike.
 */

type GroupLook = { icon: typeof Info; accent: string };

const groupLooks: Record<string, GroupLook> = {
  "start-here": { icon: MapPin, accent: "bg-sky-50 text-[#2f62b6] ring-sky-900/10" },
  "health-safety": { icon: HeartPulse, accent: "bg-rose-50 text-rose-700 ring-rose-900/10" },
  "camp-life": { icon: Leaf, accent: "bg-emerald-50 text-emerald-700 ring-emerald-900/10" },
  rules: { icon: ShieldCheck, accent: "bg-amber-50 text-[#9a5a00] ring-amber-900/10" },
  "daily-rhythm": { icon: CalendarDays, accent: "bg-orange-50 text-[#f39200] ring-orange-900/10" },
  nutrition: { icon: Utensils, accent: "bg-lime-50 text-lime-800 ring-lime-900/10" },
  "yoga-dharma": { icon: Flame, accent: "bg-violet-50 text-violet-700 ring-violet-900/10" },
  wty: { icon: Info, accent: "bg-sky-50 text-sky-700 ring-sky-900/10" },
  practice: { icon: BookOpen, accent: "bg-indigo-50 text-indigo-700 ring-indigo-900/10" },
  families: { icon: Users, accent: "bg-cyan-50 text-cyan-700 ring-cyan-900/10" },
  faq: { icon: HelpCircle, accent: "bg-purple-50 text-purple-700 ring-purple-900/10" },
};

const defaultLook: GroupLook = { icon: Info, accent: "bg-slate-50 text-slate-700 ring-slate-900/10" };

function lookFor(groupId: string) {
  return groupLooks[groupId] ?? defaultLook;
}

function SectionCard({ section }: { section: InfoSection }) {
  const hasStructuredLists = section.items.some(
    (item) => item.k === "b" || item.k === "n" || item.k === "d"
  );

  // Group consecutive same-type items to render proper list wrappers
  const groups: ContentItem[][] = [];
  for (const item of section.items) {
    const last = groups[groups.length - 1];
    if (last && last[0].k === item.k) {
      last.push(item);
    } else {
      groups.push([item]);
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-sky-900/10 bg-white shadow-sm">
      {section.title ? (
        <div className="bg-linear-to-r from-sky-50 to-orange-50 px-4 py-3">
          <h3 className="text-lg font-black leading-tight text-[#2f62b6]">{section.title}</h3>
        </div>
      ) : null}

      <div className="space-y-4 p-4">
        {groups.map((group, gi) => {
          const k = group[0].k;

          if (k === "q") {
            return (
              <Fragment key={gi}>
                {(group as Array<{ k: "q"; text: string }>).map((item) => (
                  <blockquote key={item.text.slice(0, 90)} className="rounded-xl border-l-4 border-[#f39200] bg-orange-50 px-4 py-3 text-base font-semibold leading-7 text-slate-800">
                    {item.text}
                  </blockquote>
                ))}
              </Fragment>
            );
          }

          if (k === "p") {
            return (
              <Fragment key={gi}>
                {(group as Array<{ k: "p"; text: string }>).map((item, ii) => {
                  const isFirst = gi === 0 && ii === 0 && !section.title && !hasStructuredLists;
                  return (
                    <p key={item.text.slice(0, 90)} className={`${isFirst ? "rounded-xl bg-sky-50 p-4 font-semibold text-[#2f62b6]" : "text-slate-700"} text-sm leading-7`}>
                      {item.text}
                    </p>
                  );
                })}
              </Fragment>
            );
          }

          if (k === "d") {
            return (
              <dl key={gi} className="grid gap-3">
                {(group as Array<{ k: "d"; label: string; value: string }>).map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-900/5">
                    <dt className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{item.label}</dt>
                    <dd className="mt-1 text-sm leading-6 text-slate-700">{item.value}</dd>
                  </div>
                ))}
              </dl>
            );
          }

          if (k === "n") {
            return (
              <ol key={gi} className="space-y-3">
                {(group as Array<{ k: "n"; text: string; num: number }>).map((item) => (
                  <li key={item.text.slice(0, 90)} className="flex gap-3 rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-indigo-900/5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">{item.num}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
            );
          }

          if (k === "b") {
            return (
              <ul key={gi} className="space-y-2">
                {(group as Array<{ k: "b"; text: string }>).map((item) => (
                  <li key={item.text.slice(0, 90)} className="flex gap-3 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-emerald-900/5">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            );
          }

          if (k === "fn") {
            return (
              <div key={gi} className="space-y-1 pt-1">
                {(group as Array<{ k: "fn"; text: string }>).map((item) => (
                  <p key={item.text.slice(0, 60)} className="text-xs leading-5 text-slate-400 italic">
                    {item.text}
                  </p>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}

export function InstallHintLink() {
  return (
    <Link
      href="/install"
      className="flex items-center gap-3 rounded-xl border border-[#f39200]/25 bg-white p-4 shadow-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#2f62b6] ring-1 ring-sky-100">
        <Smartphone className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-slate-950">Add app to Home Screen</p>
        <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">Step-by-step for iOS &amp; Android</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#2f62b6]" />
    </Link>
  );
}

export function InfoHub({ pages }: { pages: InfoHubPage[] }) {
  const groups = groupInfoPages(pages);

  return (
    <>
      <section aria-label="Info categories" className="grid grid-cols-2 gap-3">
        {groups.map((group) => {
          const { icon: Icon, accent } = lookFor(group.id);
          return (
            <Link key={group.id} href={`#${group.id}`} className={`rounded-xl p-4 shadow-sm ring-1 ${accent}`}>
              <Icon className="h-6 w-6" />
              <p className="mt-3 text-sm font-black leading-tight">{group.title}</p>
              <p className="mt-1 text-xs font-semibold opacity-75">{group.pages.length} {group.pages.length === 1 ? "item" : "items"}</p>
            </Link>
          );
        })}
      </section>

      <section className="space-y-5">
        {groups.map((group) => {
          const { icon: Icon, accent } = lookFor(group.id);

          return (
            <section key={group.id} id={group.id} className="scroll-mt-20 space-y-3">
              <div className="flex items-start gap-3 px-1">
                <div className={`rounded-xl p-3 ring-1 ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#2f62b6]">{group.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {group.pages.map((page) => {
                  const sections = sectionsFor(page);
                  return (
                    <details key={page.id} className={`card group rounded-xl p-4 ${isFeaturedPage(page) ? "ring-2 ring-[#f39200]/20" : ""}`}>
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                        <span>
                          <span className="block text-lg font-black leading-snug text-slate-950">{pageDisplayTitle(page)}</span>
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
    </>
  );
}
