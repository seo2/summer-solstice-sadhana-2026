import { AppLink as Link } from "@/components/app-link";
import { GraduationCap } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { ProgramView } from "@/components/program-view";
import { ScheduleNoticeBanner } from "@/components/schedule-notice";
import program from "@/data/program.json";
import venues from "@/data/venues.json";
import categories from "@/data/categories.json";
import type { Activity, Category, Venue } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const activities = program as Activity[];
const sortedDates = Array.from(new Set(activities.map((activity) => activity.date))).sort();
const dateRange = `${formatDate(sortedDates[0])} – ${formatDate(sortedDates[sortedDates.length - 1])}`;

export default function ProgramPage() {
  return (
    <div className="space-y-4">
      <ActiveEventBanner />
      <section className="flex items-start justify-between gap-3 pt-1">
        <div>
          <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Daily Schedule</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Program</h1>
          <p className="mt-1 text-sm font-semibold text-stone-600">{dateRange}</p>
        </div>
        <Link
          href="/teachers"
          className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-2 text-xs font-black text-[#2f62b6] ring-1 ring-sky-200/80"
        >
          <GraduationCap className="h-4 w-4" />
          Teachers
        </Link>
      </section>
      <ScheduleNoticeBanner />
      <ProgramView activities={activities} venues={venues as Venue[]} categories={categories as Category[]} />
    </div>
  );
}
