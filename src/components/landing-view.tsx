import { LandingActions } from "@/components/landing-actions";
import type { Landing, LandingIcon } from "@/lib/landings";
import { parsePlainText } from "@/lib/plain-text";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  ExternalLink,
  Heart,
  Info,
  type LucideIcon,
  MapPin,
  Sparkles,
  Sun,
  Tag,
  Users,
  Utensils,
} from "lucide-react";

/**
 * The landing template: one designed page rendered from a `Landing` alone.
 * Every section is optional and appears only when its content is there; the
 * order, colors and type are fixed here so staff-authored landings look like
 * the one designed by hand (A Woman's Renewal Experience, the first instance).
 * Server component — the built-in landings are part of the static export; the
 * interactive card (register / save reminder) is the client island inside.
 * See docs/LANDINGS.md.
 */

const ICONS: Record<LandingIcon, LucideIcon> = {
  calendar: CalendarDays,
  "map-pin": MapPin,
  heart: Heart,
  clock: Clock3,
  sparkles: Sparkles,
  utensils: Utensils,
  users: Users,
  tag: Tag,
  info: Info,
  sun: Sun,
};

function iconFor(name: LandingIcon | undefined, fallback: LucideIcon): LucideIcon {
  return (name && ICONS[name]) || fallback;
}

/** Tailwind needs the class spelled out; up to three columns from small screens up. */
function columnsFor(count: number): string {
  if (count <= 1) return "";
  if (count === 2) return "sm:grid-cols-2";
  return "sm:grid-cols-3";
}

/** Anchor of the FAQ section — the actions card and the banner link to it. */
export const LANDING_FAQ_ID = "landing-faq";

/** Plain-text grammar → paragraphs and bullet lists, styled per context. */
function PlainText({ text, paragraphClassName }: { text: string; paragraphClassName: string }) {
  return (
    <>
      {parsePlainText(text).map((block, index) =>
        block.kind === "paragraph" ? (
          <p key={index} className={paragraphClassName}>
            {block.text}
          </p>
        ) : (
          <ul key={index} className="space-y-1.5">
            {block.items.map((item) => (
              <li key={item} className={`flex gap-2 ${paragraphClassName}`}>
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f39200]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

function SectionHeading({ kicker, title }: { kicker?: string; title?: string }) {
  if (!kicker && !title) return null;
  return (
    <div className="px-1">
      {kicker && <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">{kicker}</p>}
      {title && <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2f62b6]">{title}</h2>}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function LandingView({ landing }: { landing: Landing }) {
  const facts = (landing.facts ?? []).slice(0, 3);
  const highlights = (landing.highlights ?? []).slice(0, 3);
  const about = landing.about;
  const includes = about?.includes ?? [];
  const days = landing.schedule?.days ?? [];
  const people = landing.people?.items ?? [];
  const faqs = landing.faq?.items ?? [];
  const faqHref = faqs.length > 0 ? `#${LANDING_FAQ_ID}` : undefined;
  const CalloutIcon = iconFor(about?.callout?.icon, Info);

  return (
    <div className="space-y-5">
      <section className="relative -mx-1 min-h-[28rem] overflow-hidden rounded-2xl bg-sky-50 shadow-[0_24px_64px_rgba(47,98,182,0.18)] sm:mx-0">
        {landing.hero?.image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={landing.hero.image} alt={landing.hero.alt ?? ""} className="absolute inset-0 h-full w-full object-cover" />
          </>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-white/88 via-white/62 to-white/18" />
        <div className="relative flex min-h-[28rem] flex-col justify-between p-5 sm:p-7">
          <div className="max-w-xl">
            <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.055em] text-[#2f62b6] sm:text-6xl">{landing.title}</h1>
            {landing.tagline && <p className="mt-4 max-w-md text-lg font-black leading-7 text-slate-900">{landing.tagline}</p>}
          </div>

          {facts.length > 0 && (
            <div className={`grid gap-2 ${columnsFor(facts.length)}`.trim()}>
              {facts.map((fact) => {
                const Icon = iconFor(fact.icon, Sparkles);
                return (
                  <div key={`${fact.label}-${fact.value}`} className="rounded-xl bg-white/88 p-3 shadow-sm ring-1 ring-sky-900/10">
                    <Icon className="h-5 w-5 text-[#f39200]" />
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{fact.label}</p>
                    <p className="mt-1 text-sm font-black text-slate-950">{fact.value}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {landing.cta && (
        <LandingActions
          landingId={landing.id}
          ctaUrl={landing.cta.url}
          ctaLabel={landing.cta.label}
          calendarUrl={landing.calendarUrl}
          faqHref={faqHref}
        />
      )}

      {highlights.length > 0 && (
        <section className={`grid gap-3 ${columnsFor(highlights.length)}`.trim()}>
          {highlights.map((highlight) => (
            <article key={highlight} className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
              <Sparkles className="h-5 w-5 text-[#f39200]" />
              <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{highlight}</p>
            </article>
          ))}
        </section>
      )}

      {about && (about.title || about.body || includes.length > 0 || about.callout) && (
        <section className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.08)]">
          <div className={about.image ? "grid gap-0 sm:grid-cols-[0.9fr_1.1fr]" : "grid gap-0"}>
            {about.image && (
              <div className="relative min-h-96 sm:min-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={about.image} alt={about.imageAlt ?? ""} className="absolute inset-0 h-full w-full object-cover object-center" />
              </div>
            )}
            <div className="p-5 sm:p-6">
              {about.kicker && <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">{about.kicker}</p>}
              {about.title && (
                <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.035em] text-[#2f62b6]">{about.title}</h2>
              )}
              {about.body && <PlainText text={about.body} paragraphClassName="mt-3 text-sm leading-7 text-slate-600" />}

              {includes.length > 0 && (
                <div className="mt-5 grid gap-2">
                  {includes.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl bg-sky-50 px-3 py-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm font-bold leading-5 text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {about.callout && (
                <div className="mt-5 rounded-xl border border-[#f39200]/20 bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <CalloutIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5a00]" />
                    <div>
                      <p className="text-sm font-black text-[#9a5a00]">{about.callout.title}</p>
                      {about.callout.body && (
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{about.callout.body}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {days.length > 0 && (
        <section className="space-y-3">
          <SectionHeading kicker={landing.schedule?.kicker ?? "Program"} title={landing.schedule?.title} />

          <div className="grid gap-3">
            {days.map((day) => (
              <article key={`${day.label}-${day.date ?? ""}`} className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#f39200]">{day.date ? `${day.label} · ${day.date}` : day.label}</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">{day.title}</h3>
                  </div>
                  <Clock3 className="h-5 w-5 shrink-0 text-[#2f62b6]" />
                </div>
                {day.items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.items.map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {people.length > 0 && (
        <section className="space-y-3">
          <SectionHeading kicker={landing.people?.kicker ?? "Teachers"} title={landing.people?.title} />

          <div className="grid gap-3 sm:grid-cols-2">
            {people.map((person) => (
              <article key={person.name} className="flex items-center gap-3 rounded-xl border border-sky-900/10 bg-white p-3 shadow-sm">
                {person.photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={person.photo} alt={person.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  </>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg font-black text-[#2f62b6]">
                    {initials(person.name)}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black leading-tight text-slate-950">{person.name}</h3>
                  {person.role && <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{person.role}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {landing.banner && (
        <section className="rounded-2xl bg-[#2f62b6] p-5 text-white shadow-[0_18px_48px_rgba(47,98,182,0.18)]">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{landing.banner.title}</h2>
          {landing.banner.body && <p className="mt-2 text-sm font-semibold leading-6 text-sky-50">{landing.banner.body}</p>}
          {landing.banner.linkLabel && (landing.banner.linkUrl || faqHref) && (
            <a
              href={landing.banner.linkUrl ?? faqHref}
              {...(landing.banner.linkUrl && !landing.banner.linkUrl.startsWith("#") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#2f62b6]"
            >
              {landing.banner.linkLabel}
              {landing.banner.linkUrl && !landing.banner.linkUrl.startsWith("#") ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <CircleHelp className="h-4 w-4" />
              )}
            </a>
          )}
        </section>
      )}

      {faqs.length > 0 && (
        <section id={LANDING_FAQ_ID} className="scroll-mt-20 space-y-3">
          <SectionHeading kicker={landing.faq?.kicker ?? "FAQ"} title={landing.faq?.title} />

          <div className="grid gap-3">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="group rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <span className="text-base font-black leading-6 text-slate-950">{faq.question}</span>
                  <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-[#2f62b6] transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-2">
                  <PlainText text={faq.answer} paragraphClassName="text-sm font-semibold leading-6 text-slate-600" />
                  {faq.links && faq.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {faq.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-900/10 bg-sky-50 px-3 py-2 text-xs font-black text-[#2f62b6]"
                        >
                          {link.label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
