import { ProgramExplorer } from "@/components/program-explorer";
import program from "@/data/program.json";
import venues from "@/data/venues.json";
import categories from "@/data/categories.json";
import type { Activity, Category, Venue } from "@/lib/types";

export default function ProgramPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-800">Daily Schedule</p>
        <h1 className="text-3xl font-black text-stone-950">Program</h1>
      </div>
      <ProgramExplorer activities={program as Activity[]} venues={venues as Venue[]} categories={categories as Category[]} />
    </div>
  );
}
