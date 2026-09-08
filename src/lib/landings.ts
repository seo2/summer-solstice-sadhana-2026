/**
 * Landings: promotional pages for something 3HO wants attendees to know about
 * — a follow-on retreat, a training, a special day — rendered by one designed
 * template (`LandingView`) from data alone, so staff write content and never
 * touch layout. Two sources, like the rest of the app: the built-in list in
 * src/data/landings.json (this file) and, next, the `landings[]` the backend
 * publishes in the Home feed. Plain module — no "use client" — so the static
 * pages, the preloader and the client components all read the same list.
 * See docs/LANDINGS.md.
 */

import landingsData from "@/data/landings.json";

/** Icons a landing may name; mapped to Lucide glyphs in landing-view.tsx. */
export type LandingIcon = "calendar" | "map-pin" | "heart" | "clock" | "sparkles" | "utensils" | "users" | "tag" | "info" | "sun";

export type LandingFact = { icon?: LandingIcon; label: string; value: string };
export type LandingLink = { label: string; href: string };
export type LandingDay = { label: string; date?: string; title: string; items: string[] };
export type LandingPerson = { name: string; role?: string; photo?: string };
/** `answer` is plain text in the info-page grammar (blank line = paragraph, ∙ = bullet). */
export type LandingFaq = { question: string; answer: string; links?: LandingLink[] };

export type Landing = {
  id: string;
  /** Scope: listed on this event's home. Absent = the app's Home. */
  eventSlug?: string;
  /** Static route of a built-in landing; synced landings open at /landing?id=<id>. */
  path?: string;
  status?: "published" | "draft";
  pinned?: boolean;
  publishedAt?: string | null;

  /** Small label on the tile ("After Solstice"). */
  kicker?: string;
  title: string;
  /** One sentence under the title in the hero. */
  tagline?: string;
  /** One or two lines on the tile. */
  summary?: string;
  startDate?: string;
  endDate?: string;
  location?: string;

  hero?: { image?: string; alt?: string };
  /** Tile image; falls back to the hero image. */
  cardImage?: string;
  cardImageAlt?: string;
  /** Up to three facts under the hero title (dates, venue, rate…). */
  facts?: LandingFact[];

  /** The one call to action — opens outside the app, which never sells anything itself. */
  cta?: { url: string; label?: string };
  /** An .ics file to offer under "Add dates to calendar". */
  calendarUrl?: string;

  /** Up to three short phrases in cards. */
  highlights?: string[];
  about?: {
    kicker?: string;
    title?: string;
    /** Plain text in the info-page grammar. */
    body?: string;
    image?: string;
    imageAlt?: string;
    includes?: string[];
    callout?: { icon?: LandingIcon; title: string; body?: string };
  };
  schedule?: { kicker?: string; title?: string; days: LandingDay[] };
  people?: { kicker?: string; title?: string; items: LandingPerson[] };
  banner?: { title: string; body?: string; linkLabel?: string; linkUrl?: string };
  faq?: { kicker?: string; title?: string; items: LandingFaq[] };
};

export const builtinLandings: Landing[] = landingsData as Landing[];

export function builtinLanding(id: string): Landing | undefined {
  return builtinLandings.find((landing) => landing.id === id);
}

/** Published landings scoped to one event, pinned first then newest. */
export function landingsForEvent(landings: Landing[], eventSlug: string): Landing[] {
  return sortLandings(landings.filter((landing) => landing.eventSlug === eventSlug && landing.status !== "draft"));
}

/** The shared page for landings that have no static route of their own (synced ones). */
export const LANDING_ROUTE = "/landing";

/**
 * Where the landing opens: its static route when built in, otherwise the
 * shared page with the id in the hash. The hash (not a query string) keeps
 * the service worker's cache key equal to `/landing`, so the page still opens
 * offline after a hard reload; `LandingPage` reads it on mount and on change.
 */
export function landingHref(landing: Landing): string {
  return landing.path ?? `${LANDING_ROUTE}#${encodeURIComponent(landing.id)}`;
}

/** Newest first, pinned on top; stable, so the built-in list keeps its order. */
export function sortLandings(landings: Landing[]): Landing[] {
  return [...landings].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
  });
}

/**
 * What the app's Home features: published landings for everyone (no
 * `eventSlug`) plus any pinned landing, whatever its scope.
 */
export function featuredLandings(landings: Landing[]): Landing[] {
  return sortLandings(landings.filter((landing) => landing.status !== "draft" && (!landing.eventSlug || landing.pinned)));
}

/** Built-in landings first, then synced ones that do not repeat a built-in id. */
export function mergeLandings(builtin: Landing[], synced: Landing[]): Landing[] {
  const ids = new Set(builtin.map((landing) => landing.id));
  return [...builtin, ...synced.filter((landing) => !ids.has(landing.id))];
}

/** Fired on window when an attendee saves interest in a landing. */
export const LANDING_INTEREST_EVENT = "landing-interest";

/** localStorage key holding "true" once the attendee tapped "Save reminder". */
export function landingInterestKey(id: string): string {
  return `${id}-interest`;
}

/** localStorage key holding "true" once the online reminder was dismissed. */
export function landingDismissedKey(id: string): string {
  return `${id}-online-dismissed`;
}

/** Local (same-origin) files a built-in landing needs offline: images and the calendar file. */
export function landingAssets(landing: Landing): string[] {
  const candidates = [
    landing.hero?.image,
    landing.cardImage,
    landing.about?.image,
    ...(landing.people?.items ?? []).map((person) => person.photo),
    landing.calendarUrl,
  ];
  const local = candidates.filter((url): url is string => typeof url === "string" && url.startsWith("/"));
  return Array.from(new Set(local));
}

/** Every image a landing shows — for warming remote ones into the offline cache. */
export function landingImageUrls(landing: Landing): string[] {
  const candidates = [landing.hero?.image, landing.cardImage, landing.about?.image, ...(landing.people?.items ?? []).map((person) => person.photo)];
  return Array.from(new Set(candidates.filter((url): url is string => typeof url === "string")));
}

const LANDING_ICONS: readonly LandingIcon[] = ["calendar", "map-pin", "heart", "clock", "sparkles", "utensils", "users", "tag", "info", "sun"];

const str = (value: unknown): string | undefined => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined);
const isoDate = (value: unknown): string | undefined => {
  const text = str(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
};
const strList = (value: unknown): string[] => (Array.isArray(value) ? value.map(str).filter((item): item is string => item !== undefined) : []);
const obj = (value: unknown): Record<string, unknown> | undefined => (value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined);
const objList = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.map(obj).filter((item): item is Record<string, unknown> => item !== undefined) : []);
const icon = (value: unknown): LandingIcon | undefined => {
  const name = str(value);
  return name && (LANDING_ICONS as readonly string[]).includes(name) ? (name as LandingIcon) : undefined;
};
const links = (value: unknown): LandingLink[] => {
  const out: LandingLink[] = [];
  for (const item of objList(value)) {
    const label = str(item.label);
    const href = str(item.href);
    if (label && href) out.push({ label, href });
  }
  return out;
};

/**
 * One landing as published by the backend → a `Landing`, or null when the
 * essentials (`id`, `title`) are missing. Everything else is optional and
 * cleaned field by field — a bad fact or photo is dropped, never the landing.
 * Like the other normalizers, silent: check that the landing shows up.
 */
export function normalizeLanding(raw: unknown): Landing | null {
  const item = obj(raw);
  if (!item) return null;
  const id = str(item.id);
  const title = str(item.title);
  if (!id || !title) return null;

  const landing: Landing = {
    id,
    title,
    eventSlug: str(item.eventSlug),
    status: item.status === "draft" ? "draft" : "published",
    pinned: item.pinned === true,
    publishedAt: str(item.publishedAt) ?? null,
    kicker: str(item.kicker),
    tagline: str(item.tagline),
    summary: str(item.summary),
    startDate: isoDate(item.startDate),
    endDate: isoDate(item.endDate),
    location: str(item.location),
    cardImage: str(item.cardImage),
    cardImageAlt: str(item.cardImageAlt),
    calendarUrl: str(item.calendarUrl),
    highlights: strList(item.highlights),
  };

  const hero = obj(item.hero);
  if (hero && str(hero.image)) landing.hero = { image: str(hero.image), alt: str(hero.alt) };

  const facts: LandingFact[] = [];
  for (const fact of objList(item.facts)) {
    const label = str(fact.label);
    const value = str(fact.value);
    if (label && value) facts.push({ icon: icon(fact.icon), label, value });
  }
  landing.facts = facts;

  const cta = obj(item.cta);
  const ctaUrl = cta ? str(cta.url) : undefined;
  if (cta && ctaUrl) landing.cta = { url: ctaUrl, label: str(cta.label) };

  const about = obj(item.about);
  if (about) {
    const callout = obj(about.callout);
    const calloutTitle = callout ? str(callout.title) : undefined;
    const section: NonNullable<Landing["about"]> = {
      kicker: str(about.kicker),
      title: str(about.title),
      body: str(about.body),
      image: str(about.image),
      imageAlt: str(about.imageAlt),
      includes: strList(about.includes),
      callout: callout && calloutTitle ? { icon: icon(callout.icon), title: calloutTitle, body: str(callout.body) } : undefined,
    };
    if (section.title || section.body || section.image || section.includes?.length || section.callout) landing.about = section;
  }

  const schedule = obj(item.schedule);
  if (schedule) {
    const days: LandingDay[] = [];
    for (const day of objList(schedule.days)) {
      const label = str(day.label);
      const title = str(day.title);
      if (label && title) days.push({ label, date: str(day.date), title, items: strList(day.items) });
    }
    if (days.length > 0) landing.schedule = { kicker: str(schedule.kicker), title: str(schedule.title), days };
  }

  const people = obj(item.people);
  if (people) {
    const items: LandingPerson[] = [];
    for (const person of objList(people.items)) {
      const name = str(person.name);
      if (name) items.push({ name, role: str(person.role), photo: str(person.photo) });
    }
    if (items.length > 0) landing.people = { kicker: str(people.kicker), title: str(people.title), items };
  }

  const banner = obj(item.banner);
  const bannerTitle = banner ? str(banner.title) : undefined;
  if (banner && bannerTitle) {
    landing.banner = { title: bannerTitle, body: str(banner.body), linkLabel: str(banner.linkLabel), linkUrl: str(banner.linkUrl) };
  }

  const faq = obj(item.faq);
  if (faq) {
    const items: LandingFaq[] = [];
    for (const entry of objList(faq.items)) {
      const question = str(entry.question);
      const answer = str(entry.answer);
      if (question && answer) items.push({ question, answer, links: links(entry.links) });
    }
    if (items.length > 0) landing.faq = { kicker: str(faq.kicker), title: str(faq.title), items };
  }

  return landing;
}
