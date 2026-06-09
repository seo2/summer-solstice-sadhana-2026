import Image from "next/image";
import venues from "@/data/venues.json";
import program from "@/data/program.json";
import type { Activity, Venue } from "@/lib/types";

const activities = program as Activity[];

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
