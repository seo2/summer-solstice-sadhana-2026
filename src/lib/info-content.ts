/**
 * Info Hub content model shared by the built-in event (booklet JSON) and
 * synced events (bundle `infoPages`). Pure functions, no React:
 *
 *  - `groupInfoPages()` sorts pages into the topic catalog below (by the
 *    page's `group` key when the bundle carries one, else by known page id)
 *    and parks the rest under "More".
 *  - `sectionsFor()` turns a page's plain text into section cards with
 *    paragraphs, bullet and numbered lists, definitions, quotes and footnotes.
 *
 * Authoring conventions for synced pages (written fresh in wp-admin):
 *  - `## Heading` opens a section card (any known booklet heading works too).
 *  - A blank line or `¶` starts a new paragraph.
 *  - `∙` `•` `—` `-` start a bullet; `1.` `2.` … a numbered item.
 *  - `Label: value` with a known label (Posture, Mantra, Time…) renders as a
 *    definition; `> text` renders as a quote; `*` or `**` open a footnote.
 */

export type InfoHubPage = {
  id: string;
  title: string;
  content: string;
  /** Topic key from the catalog; falls back to the page id's known group. */
  group?: string;
  /** Order inside the group (lower first); pages without it follow catalog order. */
  sort?: number;
  /** Highlighted card (orange ring). */
  featured?: boolean;
};

export type InfoGroupSpec = {
  id: string;
  title: string;
  description: string;
  /** Page ids that belong here when the page carries no `group` of its own. */
  pages: string[];
};

export type InfoGroup = Omit<InfoGroupSpec, "pages"> & { pages: InfoHubPage[] };

export type ContentItem =
  | { k: "p"; text: string }
  | { k: "b"; text: string }
  | { k: "n"; text: string; num: number }
  | { k: "d"; label: string; value: string }
  | { k: "q"; text: string }
  | { k: "fn"; text: string };

export type InfoSection = {
  title?: string;
  items: ContentItem[];
};

export const MORE_GROUP_ID = "more";

/** Topic catalog. Order here is the order on screen. */
export const infoGroupCatalog: InfoGroupSpec[] = [
  {
    id: "start-here",
    title: "Start Here",
    description: "Orientation, getting around, climate, hydration and basic camp setup.",
    pages: ["page-welcome", "page-9", "page-terms", "page-bringing-home"],
  },
  {
    id: "health-safety",
    title: "Health & Safety",
    description: "First Aid, emergency response, medical needs, phones and media boundaries.",
    pages: ["page-13", "page-14", "page-17"],
  },
  {
    id: "camp-life",
    title: "Camp Life",
    description: "Meals, showers, toilets, bazaar, lost & found, leaving camp and security.",
    pages: ["page-12", "page-15", "page-16", "page-eco-3ho"],
  },
  {
    id: "rules",
    title: "Community Agreements",
    description: "The full Code of Conduct, cleaned for offline reading.",
    pages: ["code-of-conduct"],
  },
  {
    id: "daily-rhythm",
    title: "Daily Rhythm",
    description: "Wake-up call, hydrotherapy, Sadhana, meals, classes and evening programs.",
    pages: ["page-49", "page-50", "page-51", "page-solstice-diet", "page-52"],
  },
  {
    id: "nutrition",
    title: "Nutrition",
    description: "The Solstice diet, Yogi Tea and how to eat well through the week.",
    pages: [],
  },
  {
    id: "yoga-dharma",
    title: "Yoga & Dharma",
    description: "Sikh Dharma, Gurdwara, Kundalini Yoga and Karma Yoga — the spiritual practices of Solstice.",
    pages: ["page-sikh-dharma", "page-gurdwara-detailed", "page-kundalini-yoga", "page-karma-yoga", "page-aquarian-sadhana-mantras"],
  },
  {
    id: "wty",
    title: "White Tantric Yoga®",
    description: "Participant guidelines, mantras for courses #110–#112, and monitor & organizer reference.",
    pages: ["page-wty-intro", "page-wty-mantras", "page-wty-organizer", "page-wty-monitor"],
  },
  {
    id: "practice",
    title: "Practice & Inspiration",
    description: "Solstice meditation instructions and inspirational opening pages.",
    pages: ["page-5", "page-8"],
  },
  {
    id: "families",
    title: "Families",
    description: "Youth Camp information for parents and children.",
    pages: ["page-21"],
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Frequently asked questions about tickets, accommodations, payments and cancellations.",
    pages: ["page-faq-general", "page-faq-tickets", "page-faq-accommodations", "page-faq-payment", "page-faq-cancellation"],
  },
  {
    id: MORE_GROUP_ID,
    title: "More",
    description: "Other information published by the event team.",
    pages: [],
  },
];

/** Attendee-facing titles for booklet pages whose extracted title is an artifact. */
export const pageTitles: Record<string, string> = {
  "page-welcome": "Welcome",
  "page-sikh-dharma": "Sikh Dharma",
  "page-gurdwara-detailed": "Gurdwara",
  "page-solstice-diet": "The Solstice Diet, Food of the Yogis",
  "page-kundalini-yoga": "Kundalini Yoga",
  "page-karma-yoga": "Karma Yoga",
  "page-aquarian-sadhana-mantras": "Aquarian Sadhana Mantras",
  "page-wty-intro": "White Tantric Yoga®",
  "page-wty-mantras": "WTY Mantras",
  "page-wty-organizer": "Organizer & Head Monitor Guidelines",
  "page-wty-monitor": "Monitor Guidelines",
  "page-terms": "Terms Heard Around Camp",
  "page-bringing-home": "Bringing Solstice Home",
  "page-eco-3ho": "Eco-3HO",
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
  "page-faq-general": "General",
  "page-faq-tickets": "Tickets & Registration",
  "page-faq-accommodations": "Accommodations",
  "page-faq-payment": "Payment Methods",
  "page-faq-cancellation": "Cancellation & Refund",
};

/** Booklet pages that read as the event's headline documents. */
const featuredPageIds = new Set(["code-of-conduct", "page-17"]);

export function pageDisplayTitle(page: InfoHubPage) {
  return pageTitles[page.id] ?? page.title;
}

export function isFeaturedPage(page: InfoHubPage) {
  return page.featured === true || featuredPageIds.has(page.id);
}

/**
 * Sort pages into catalog groups. A page's own `group` key wins; otherwise
 * the catalog's page-id lists decide; anything left goes under "More".
 * Groups without pages are dropped. Inside a group: explicit `sort` first,
 * then catalog order, then the order the pages arrived in.
 */
export function groupInfoPages(pages: InfoHubPage[], catalog: InfoGroupSpec[] = infoGroupCatalog): InfoGroup[] {
  const groupIds = new Set(catalog.map((group) => group.id));
  const homeById = new Map<string, string>();
  for (const group of catalog) {
    for (const id of group.pages) if (!homeById.has(id)) homeById.set(id, group.id);
  }

  const buckets = new Map<string, InfoHubPage[]>();
  pages.forEach((page) => {
    const key = page.group && groupIds.has(page.group) ? page.group : homeById.get(page.id) ?? MORE_GROUP_ID;
    const bucket = buckets.get(key) ?? [];
    bucket.push(page);
    buckets.set(key, bucket);
  });

  return catalog
    .map((group) => {
      const members = buckets.get(group.id) ?? [];
      const catalogIndex = (page: InfoHubPage) => {
        const index = group.pages.indexOf(page.id);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
      };
      const arrival = new Map(members.map((page, index) => [page.id, index]));
      const sorted = [...members].sort((a, b) => {
        const bySort = (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER);
        if (bySort !== 0) return bySort;
        const byCatalog = catalogIndex(a) - catalogIndex(b);
        if (byCatalog !== 0) return byCatalog;
        return (arrival.get(a.id) ?? 0) - (arrival.get(b.id) ?? 0);
      });
      return { ...group, pages: sorted };
    })
    .filter((group) => group.pages.length > 0);
}

// ---------------------------------------------------------------------------
// Section parsing
// ---------------------------------------------------------------------------

/** Booklet headings that open a section card (legacy content has no `##`). */
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
  "Bazaar Hours (may be changed at 3HO's discretion):",
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
  // Sikh Dharma
  "What is Sikh Dharma?",
  // Gurdwara detailed
  "Program",
  "Attending Gurdwara",
  "Kirtan Darbar",
  "Sehaj Path",
  // Solstice Diet
  "Solstice Hot Sauce",
  "Yogi Tea",
  "Golden Milk",
  // Kundalini Yoga
  "Kriya Techniques",
  "Key Effects",
  // Terms
  "Terms Heard Around Camp",
  "Adi Shakti",
  "Akhand Path",
  "Amrit Ceremony",
  "Anand Karaj",
  "Ardas",
  "Bole So Nihal, Sat Siri Akal",
  "Gatka",
  "G.O.D.",
  "Gurbani",
  "Kaur",
  "Kirtan Sohila",
  "Nagar Kirtan",
  "Rehiras",
  "Sat Nam",
  "Shabad",
  "Sikh Vows",
  "Singh",
  "Wahe Guru Ji Ka Khalsa, Wahe Guru Ji Ki Fateh!",
  // White Tantric Yoga
  "Course #110",
  "Course #111",
  "Course #112",
  "Before WTY",
  "During WTY",
  "Before WTY Begins",
  "Once WTY Begins",
  "For the First 5 Minutes of Each Meditation",
  "Breaks",
  "Policies and Energetics",
  // Aquarian Sadhana Mantras
  "Morning Call (7 minutes)",
  "Waah Yantee, Kar Yantee (7 minutes)",
  "The Mul Mantra (7 minutes)",
  "Sat Siri, Siri Akal (7 minutes)",
  "Rakhe Rakhan Har (7 minutes)",
  "Wahe Guru Wahe Jio (22 minutes)",
  "Guru Ram Das Chant (5 minutes)",
  // Eco-3HO
  "Waste Management and You!",
  "Pack It In, Pack It Out",
  "Compost FOOD WASTE ONLY!",
  "Recycling",
  "Trash",
  // FAQ — General
  "Can I attend if I have never done Kundalini Yoga before?",
  "Who can I contact if I have questions about my registration?",
  // FAQ — Tickets
  "How do I purchase tickets for Solstice?",
  "Are tickets available for purchase onsite?",
  "What is included in a ticket?",
  "Are there any discounts available for early bird tickets?",
  "Until when is the Early Bird discount available?",
  "How much discount do I receive as an IKYTA or Premium 3HO member?",
  "What should I do if I haven't received my ticket confirmation email?",
  "Are there any age restrictions for attending the event?",
  "What are the terms and conditions I agree to when purchasing a ticket?",
  // FAQ — Accommodations
  "What types of accommodation are available at the event?",
  "Can I reserve a specific type of accommodation in advance?",
  "Can I choose who I share a dorm room with?",
  "Is parking available?",
  "Can I make changes to my accommodation after purchase?",
  "Can I bring my own tent?",
  // FAQ — Payment
  "What payment options are available?",
  "Why do I need to pay the transaction fees?",
  // FAQ — Cancellation
  "What is the refund policy if I need to cancel my ticket?",
  "Is there a cancellation fee?",
  "Can I transfer my ticket to someone else?",
  "What happens if the event is canceled due to unforeseen circumstances?",
]);

const definitionLabels = new Set(["Posture", "Mantra", "Meaning of the Mantra", "Breath", "Mudra", "Eye Focus", "Time", "End", "Comments", "Directions"]);

/** Repairs typical PDF-extraction artifacts in booklet text. Harmless on clean text. */
export function cleanText(value: string) {
  return value
    .replace(/­/g, "")
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

/** Pages whose first line doubles as their first section heading, so it must survive title filtering. */
const keepTitleIds = new Set(["page-8", "page-16", "page-21", "page-50", "page-51", "page-52"]);

function normalizeLines(page: InfoHubPage) {
  return page.content
    .replace(/­/g, "")
    .split(/\n+/g)
    .map(cleanText)
    .filter(Boolean)
    .filter((line) => (keepTitleIds.has(page.id) || (line !== page.title && line !== pageTitles[page.id])) && line !== "Stuff You Need to Know" && line !== "Daily Activites" && line !== "Daily Activities");
}

function createSection(title?: string): InfoSection {
  return { title, items: [] };
}

function pushParagraph(section: InfoSection, buffer: string[]) {
  if (!buffer.length) return;
  section.items.push({ k: "p", text: cleanText(buffer.join(" ")) });
  buffer.length = 0;
}

/** `## Heading` (one to three hashes) or a known booklet heading. */
function headingOf(line: string): string | null {
  const explicit = line.match(/^#{1,3}\s+(.+?)\s*$/);
  if (explicit) return explicit[1].replace(/:$/, "");
  return sectionHeadings.has(line) ? line.replace(/:$/, "") : null;
}

export function sectionsFor(page: InfoHubPage) {
  const lines = normalizeLines(page);
  const sections: InfoSection[] = [];
  let current = createSection();
  const paragraphBuffer: string[] = [];
  const quoteBuffer: string[] = [];
  const footnoteBuffer: string[] = [];
  let explicitQuote = false;

  const flushQuote = () => {
    explicitQuote = false;
    if (!quoteBuffer.length) return;
    current.items.push({ k: "q", text: cleanText(quoteBuffer.join(" ")) });
    quoteBuffer.length = 0;
  };

  const flushFootnote = () => {
    if (!footnoteBuffer.length) return;
    current.items.push({ k: "fn", text: cleanText(footnoteBuffer.join(" ")) });
    footnoteBuffer.length = 0;
  };

  const commitSection = () => {
    pushParagraph(current, paragraphBuffer);
    flushQuote();
    flushFootnote();
    if (current.title || current.items.length > 0) {
      sections.push(current);
    }
  };

  for (const line of lines) {
    // `> quote` lines: consecutive ones form one quote; anything else closes it.
    const quoteLine = line.match(/^>\s*(.*)$/);
    if (quoteLine) {
      if (!explicitQuote) {
        pushParagraph(current, paragraphBuffer);
        flushQuote();
        flushFootnote();
        explicitQuote = true;
      }
      if (quoteLine[1]) quoteBuffer.push(quoteLine[1]);
      continue;
    }
    if (explicitQuote) flushQuote();

    const heading = headingOf(line);
    if (heading !== null) {
      commitSection();
      current = createSection(heading);
      continue;
    }

    if (/^[∙•—-]\s*/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      flushQuote();
      flushFootnote();
      current.items.push({ k: "b", text: cleanText(line.replace(/^[∙•—-]\s*/, "")) });
      continue;
    }

    if (/^\d+\.\s*/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      flushQuote();
      const numMatch = line.match(/^(\d+)\./);
      const num = numMatch ? parseInt(numMatch[1]) : 1;
      current.items.push({ k: "n", text: cleanText(line.replace(/^\d+\.\s*/, "")), num });
      continue;
    }

    const definitionMatch = line.match(/^([^:]{3,36}):\s+(.+)$/);
    if (definitionMatch && definitionLabels.has(definitionMatch[1])) {
      pushParagraph(current, paragraphBuffer);
      flushQuote();
      current.items.push({ k: "d", label: definitionMatch[1], value: cleanText(definitionMatch[2]) });
      continue;
    }

    if (/^[“\"]/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      flushQuote();
      quoteBuffer.push(line);
      // Single-line quote: opens AND closes on the same line
      if (/["“”]/.test(line.slice(1))) flushQuote();
      continue;
    }

    // Attribution closes the open quote buffer; otherwise becomes its own quote entry
    if (/Yogi Bhajan/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      quoteBuffer.push(line);
      flushQuote();
      continue;
    }

    // Continuation of an open multi-line quote
    if (quoteBuffer.length > 0) {
      quoteBuffer.push(line);
      continue;
    }

    // Explicit paragraph break marker
    if (line === "¶") {
      pushParagraph(current, paragraphBuffer);
      continue;
    }

    // Asterisk-prefixed footnote notes
    if (/^\*{1,2}/.test(line)) {
      pushParagraph(current, paragraphBuffer);
      flushQuote();
      flushFootnote();
      footnoteBuffer.push(line);
      continue;
    }

    // Continuation of an open footnote
    if (footnoteBuffer.length > 0) {
      footnoteBuffer.push(line);
      continue;
    }

    paragraphBuffer.push(line);
  }

  commitSection();
  return sections;
}
