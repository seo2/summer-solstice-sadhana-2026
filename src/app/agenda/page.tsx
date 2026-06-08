import { ProgramExplorer } from "@/components/program-explorer";
import program from "@/data/program.json";
import venues from "@/data/venues.json";
import categories from "@/data/categories.json";
import type { Activity, Category, Venue } from "@/lib/types";

export default function AgendaPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f39200]">Saved offline</p>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-[#2f62b6]">My Agenda</h1>
        <p className="mt-1 text-sm font-semibold text-stone-500">Your personal Solstice plan, saved locally on this device.</p>
      </div>
      <ProgramExplorer activities={program as Activity[]} venues={venues as Venue[]} categories={categories as Category[]} mode="agenda" />
    </div>
  );
}
