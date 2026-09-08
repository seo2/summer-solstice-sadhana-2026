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

/** Published landings scoped to one event, in list order. */
export function landingsForEvent(landings: Landing[], eventSlug: string): Landing[] {
  return landings.filter((landing) => landing.eventSlug === eventSlug && landing.status !== "draft");
}

/** Where the landing opens: its static route when built in, the shared /landing page otherwise. */
export function landingHref(landing: Landing): string {
  return landing.path ?? `/landing?id=${encodeURIComponent(landing.id)}`;
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
