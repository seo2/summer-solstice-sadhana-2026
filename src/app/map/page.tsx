"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import venues from "@/data/venues.json";
import program from "@/data/program.json";
import type { Activity, Venue } from "@/lib/types";

const activities = program as Activity[];
const MAP_WIDTH = 1266;
const MAP_HEIGHT = 1204;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.75;
const ZOOM_STEP = 0.25;

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
  const [zoom, setZoom] = useState(1);
  const mapSize = useMemo(() => ({ width: Math.round(MAP_WIDTH * zoom), height: Math.round(MAP_HEIGHT * zoom) }), [zoom]);

  const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-800">Camp Map</p>
        <h1 className="text-3xl font-black text-stone-950">Venues</h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">Use this camp map to find key venues and gathering spaces during Summer Solstice.</p>
      </div>
      <div className="card rounded-[2rem] p-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2 pt-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Scroll to explore the full map</p>
          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-sky-900/10">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[#2f62b6] disabled:opacity-40"
              aria-label="Zoom out map"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-12 text-center text-xs font-black text-stone-600">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f62b6] text-white disabled:opacity-40"
              aria-label="Zoom in map"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="app-map-scroll max-h-[70vh] overflow-auto rounded-[1.6rem] bg-white overscroll-contain">
          <Image
            src="/images/camp-map.png"
            alt="Camp map for Summer Solstice 2026"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="max-w-none rounded-[1.6rem]"
            style={mapSize}
            priority
          />
        </div>
      </div>
      <section className="card rounded-[2rem] p-4">
        <h2 className="text-xl font-black text-stone-950">Map Legend</h2>
        <div className="mt-4 grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {mapLegend.map((item) => (
            <div key={item.number} className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-stone-950 text-lg font-black text-stone-950 shadow-sm"
                style={{ backgroundColor: item.color }}
              >
                {item.number}
              </span>
              <span className="whitespace-pre-line pt-1 text-lg font-medium leading-tight text-stone-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
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
