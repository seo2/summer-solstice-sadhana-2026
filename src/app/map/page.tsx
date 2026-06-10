import { MapViewer } from "./map-viewer";

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
      <MapViewer />
      <section className="card rounded-2xl p-4">
        <h2 className="text-xl font-black text-stone-950">Map Legend</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-3">
          {mapLegend.map((item) => (
            <div key={item.number} className="flex items-start gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-stone-950 text-sm font-black text-stone-950 shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                {item.number}
              </span>
              <span className="whitespace-pre-line pt-0.5 text-sm font-medium leading-tight text-stone-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
