import Image from "next/image";
import venues from "@/data/venues.json";
import program from "@/data/program.json";
import type { Activity, Venue } from "@/lib/types";

const activities = program as Activity[];

const mapLegend = [
  { number: 1, label: "SSS Cabin", color: "#e8a323" },
  { number: 2, label: "Hospitality", color: "#88aa50" },
  { number: 3, label: "Admin", color: "#f3b6db" },
  { number: 4, label: "Showers\nFlush Toilets\nFamily Showers", color: "#55c4e6" },
  { number: 5, label: "Tantric Shelter", color: "#d97843" },
  { number: 6, label: "Atma Shelter", color: "#df824f" },
  { number: 7, label: "Prem Shelter", color: "#dc7840" },
  { number: 8, label: "SDI Academy", color: "#e47f45" },
  { number: 9, label: "Kids Camp", color: "#f2dc27" },
  { number: 11, label: "First Aid", color: "#e5272f" },
  { number: 12, label: "Dining / Bazaar\nRegistration", color: "#9c84c5" },
  { number: 13, label: "Kitchen", color: "#c8beb9" },
  { number: 14, label: "Adobe Cabins", color: "#ffffff" },
];

export default function MapPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-800">Camp Map</p>
        <h1 className="text-3xl font-black text-stone-950">Venues</h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">Use this camp map to find key venues and gathering spaces during Summer Solstice.</p>
      </div>
      <div className="card overflow-hidden rounded-[2rem] p-2">
        <Image
          src="/images/camp-map.png"
          alt="Camp map for Summer Solstice 2026"
          width={1266}
          height={1204}
          className="h-auto w-full rounded-[1.6rem]"
          priority
        />
      </div>
      <section className="space-y-3">
        {(venues as Venue[]).map((venue) => {
          const count = activities.filter((activity) => activity.location === venue.name).length;
          return (
            <div key={venue.id} className="card rounded-3xl p-4">
              <h2 className="text-xl font-black text-stone-950">{venue.name}</h2>
              <p className="mt-1 text-sm text-stone-600">{count} scheduled activities</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">{venue.description}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
