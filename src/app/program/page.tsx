import { ProgramExplorer } from "@/components/program-explorer";
import program from "@/data/program.json";
import venues from "@/data/venues.json";
import categories from "@/data/categories.json";
import type { Activity, Category, Venue } from "@/lib/types";

export default function ProgramPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="solstice-kicker text-sm font-bold uppercase">Daily Schedule</p>
        <h1 className="text-3xl font-black text-[#2f62b6]">Program</h1>
      </div>
      <ProgramExplorer activities={program as Activity[]} venues={venues as Venue[]} categories={categories as Category[]} />
    </div>
  );
}
