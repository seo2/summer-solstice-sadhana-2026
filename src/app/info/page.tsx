import { Fragment } from "react";
import { AppLink as Link } from "@/components/app-link";
import { BookOpen, CalendarDays, ChevronDown, ChevronRight, Flame, HeartPulse, HelpCircle, Info, Leaf, MapPin, ShieldCheck, Smartphone, Users } from "lucide-react";
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

type ContentItem =
  | { k: "p"; text: string }
  | { k: "b"; text: string }
  | { k: "n"; text: string; num: number }
  | { k: "d"; label: string; value: string }
  | { k: "q"; text: string }
  | { k: "fn"; text: string };

type InfoSection = {
  title?: string;
  items: ContentItem[];
};

const pageTitles: Record<string, string> = {
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

const infoGroups: InfoGroup[] = [
  {
    id: "start-here",
    title: "Start Here",
    description: "Orientation, getting around, climate, hydration and basic camp setup.",
    icon: MapPin,
    accent: "bg-sky-50 text-[#2f62b6] ring-sky-900/10",
    pages: ["page-welcome", "page-9", "page-terms", "page-bringing-home"],
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
    pages: ["page-12", "page-15", "page-16", "page-eco-3ho"],
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
    pages: ["page-49", "page-50", "page-51", "page-solstice-diet", "page-52"],
  },
  {
    id: "yoga-dharma",
    title: "Yoga & Dharma",
    description: "Sikh Dharma, Gurdwara, Kundalini Yoga and Karma Yoga — the spiritual practices of Solstice.",
    icon: Flame,
    accent: "bg-violet-50 text-violet-700 ring-violet-900/10",
    pages: ["page-sikh-dharma", "page-gurdwara-detailed", "page-kundalini-yoga", "page-karma-yoga", "page-aquarian-sadhana-mantras"],
  },
  {
    id: "wty",
    title: "White Tantric Yoga®",
    description: "Participant guidelines, mantras for courses #110–#112, and monitor & organizer reference.",
    icon: Info,
    accent: "bg-sky-50 text-sky-700 ring-sky-900/10",
    pages: ["page-wty-intro", "page-wty-mantras", "page-wty-organizer", "page-wty-monitor"],
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
  {
    id: "faq",
    title: "FAQ",
    description: "Frequently asked questions about tickets, accommodations, payments and cancellations.",
    icon: HelpCircle,
    accent: "bg-purple-50 text-purple-700 ring-purple-900/10",
    pages: ["page-faq-general", "page-faq-tickets", "page-faq-accommodations", "page-faq-payment", "page-faq-cancellation"],
  },
];

const pagesById = new Map((infoPages as InfoPage[]).map((page) => [page.id, page]));

function cleanText(value: string) {
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

const keepTitleIds = new Set(["page-8", "page-16", "page-21", "page-50", "page-51", "page-52"]);

function normalizeLines(page: InfoPage) {
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

function isSectionHeading(line: string) {
  return sectionHeadings.has(line);
}

function sectionsFor(page: InfoPage) {
  const lines = normalizeLines(page);
  const sections: InfoSection[] = [];
  let current = createSection();
  const paragraphBuffer: string[] = [];
  const quoteBuffer: string[] = [];
  const footnoteBuffer: string[] = [];

  const flushQuote = () => {
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
    if (isSectionHeading(line)) {
      commitSection();
      current = createSection(line.replace(/:$/, ""));
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

export default function InfoPage() {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-xl bg-[#2f62b6] p-5 text-white shadow-xl">
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

      <section aria-label="Info categories" className="grid grid-cols-2 gap-3">
        {infoGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Link key={group.id} href={`#${group.id}`} className={`rounded-xl p-4 shadow-sm ring-1 ${group.accent}`}>
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
                <div className={`rounded-xl p-3 ring-1 ${group.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#2f62b6]">{group.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {groupPages.map((page) => {
                  const isFeatured = page.id === "code-of-conduct" || page.id === "page-17";
                  const sections = sectionsFor(page);
                  return (
                    <details key={page.id} className={`card group rounded-xl p-4 ${isFeatured ? "ring-2 ring-[#f39200]/20" : ""}`}>
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

    </div>
  );
}
