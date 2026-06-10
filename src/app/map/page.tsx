import { MapViewer } from "./map-viewer";

export default function MapPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-800">Camp Map</p>
        <h1 className="text-3xl font-black text-stone-950">Venues</h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">Use this camp map to find key venues and gathering spaces during Summer Solstice.</p>
      </div>
      <MapViewer />
    </div>
  );
}
