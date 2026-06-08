import { ProgramExplorer } from "@/components/program-explorer";
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
      <section className="pt-1">
        <p className="solstice-kicker text-xs font-black uppercase">Daily Schedule</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Program</h1>
        <p className="mt-1 text-sm font-semibold text-stone-600">{dateRange} · {activities.length} activities</p>
      </section>
      <ProgramExplorer activities={activities} venues={venues as Venue[]} categories={categories as Category[]} />
    </div>
  );
}
