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
        <p className="mt-2 text-sm leading-6 text-stone-700">Initial offline venue index. Replace this placeholder with the official map image or vector from the booklet in the next content pass.</p>
      </div>
      <div className="card rounded-[2rem] p-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-orange-100 to-sky-100 p-5">
          <div className="absolute left-[42%] top-[22%] rounded-full bg-stone-950 px-3 py-2 text-xs font-bold text-white">Tantric Shelter</div>
          <div className="absolute left-[12%] top-[42%] rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-900 shadow">Dining Hall</div>
          <div className="absolute bottom-[18%] left-[46%] rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-900 shadow">Atma Shelter</div>
          <div className="absolute right-[8%] top-[50%] rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-900 shadow">SDI Academy</div>
          <div className="absolute bottom-[10%] right-[24%] rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-900 shadow">Prem Shelter</div>
        </div>
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
