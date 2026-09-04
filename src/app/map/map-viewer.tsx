"use client";

import { List, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Venue } from "@/lib/types";

const MAP_WIDTH = 1266;
const MAP_HEIGHT = 1204;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/**
 * One pin on the map. `point` is a percentage (0–100) of the image width and
 * height, so the same legend works whatever size the map file is served at
 * and whether the image dimensions are known up front or measured on load.
 */
export type MapLegendItem = {
  id: string;
  number: number;
  /** Full name — tooltip title and legend modal. */
  name: string;
  /** Shorter label for the chip row; falls back to `name`. */
  short?: string;
  /** Extra lines under the name (services offered, a venue description…). */
  detail?: string;
  color: string;
  point: { x: number; y: number };
  /** Rank in the quick-access chip row (1 = first); absent = not a chip. */
  featured?: number;
};

// Built-in Ram Das Puri legend, measured in pixels on the 1266×1204 map.
const builtinPins: { number: number; name: string; short?: string; detail?: string; color: string; px: number; py: number; featured?: number }[] = [
  { number: 1, name: "SSS Cabin", color: "#e8a323", px: 434, py: 424 },
  { number: 2, name: "Cool Room", color: "#88aa50", px: 574, py: 397, featured: 3 },
  { number: 3, name: "Admin / Security", color: "#f3b6db", px: 601, py: 460 },
  { number: 4, name: "Showers", detail: "Flush Toilets\nFamily Showers", color: "#55c4e6", px: 631, py: 372, featured: 5 },
  { number: 5, name: "Tantric Shelter", short: "Tantric", color: "#d97843", px: 914, py: 444, featured: 4 },
  { number: 6, name: "Atma Shelter", short: "Atma", color: "#df824f", px: 884, py: 705 },
  { number: 7, name: "Prem Shelter", short: "Prem", color: "#dc7840", px: 854, py: 546 },
  { number: 8, name: "SDI Academy", short: "SDI", color: "#e47f45", px: 772, py: 770 },
  { number: 9, name: "Kids Camp", color: "#f2dc27", px: 710, py: 918 },
  { number: 10, name: "First Aid / Hospitality", color: "#e5272f", px: 544, py: 711, featured: 2 },
  { number: 11, name: "Dining / Bazaar", short: "Dining", detail: "Registration", color: "#9c84c5", px: 681, py: 614, featured: 1 },
  { number: 12, name: "Kitchen", color: "#c8beb9", px: 556, py: 532 },
  { number: 13, name: "Adobe Cabins", short: "Cabins", color: "#ffffff", px: 315, py: 1003 },
];

export const BUILTIN_LEGEND: MapLegendItem[] = builtinPins.map(({ px, py, ...pin }) => ({
  ...pin,
  id: `builtin-${pin.number}`,
  point: { x: (px / MAP_WIDTH) * 100, y: (py / MAP_HEIGHT) * 100 },
}));

const FALLBACK_COLORS = ["#f39200", "#2f62b6", "#88aa50", "#9c84c5", "#55c4e6", "#e5272f", "#f2dc27", "#d97843"];

/**
 * Legend for a synced event: every venue that carries a `mapPoint` becomes a
 * pin. Missing numbers are filled with the next free integer and missing
 * colors cycle through a palette, so a partially annotated venue list still
 * renders a usable legend.
 */
export function legendFromVenues(venues: Venue[]): MapLegendItem[] {
  const placed = venues.filter((venue) => venue.mapPoint);
  const taken = new Set(placed.map((venue) => venue.number).filter((n): n is number => typeof n === "number"));
  let next = 1;
  const nextFree = () => {
    while (taken.has(next)) next += 1;
    taken.add(next);
    return next;
  };

  return placed
    .map((venue, index) => ({
      id: venue.id,
      number: venue.number ?? nextFree(),
      name: venue.name,
      detail: venue.description,
      color: venue.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      point: venue.mapPoint!,
      featured: venue.featured,
    }))
    .sort((a, b) => a.number - b.number);
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const BUILTIN_SRC = "/images/camp-map.png";

type MapViewerProps = {
  /** Map image URL — defaults to the built-in Ram Das Puri map. */
  src?: string;
  /** Pins to draw; defaults to the built-in legend for the built-in map, none otherwise. */
  legend?: MapLegendItem[];
  alt?: string;
  eyebrow?: string;
  title?: string;
};

export function MapViewer({
  src = BUILTIN_SRC,
  legend = src === BUILTIN_SRC ? BUILTIN_LEGEND : [],
  alt = "Camp map for Summer Solstice 2026",
  eyebrow = "Ram Das Puri",
  title = "Camp orientation",
}: MapViewerProps = {}) {
  // The built-in map has known dimensions; synced maps are measured on load.
  const isBuiltin = src === BUILTIN_SRC;
  const [dims, setDims] = useState({ w: MAP_WIDTH, h: MAP_HEIGHT });
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);

  // Zoom the DOM currently reflects — updated in the layout effect after each
  // commit. Button zoom and pinch anchor their scroll math on it, i.e. on what
  // is actually on screen, never on state still waiting to render.
  const domZoomRef = useRef(1);
  // Pinch state recorded when the second finger lands
  const pinchRef = useRef({ active: false, startDist: 0, startZoom: 1 });
  // Scroll target set by pinch, applied after the image resizes in layout effect
  const pendingScrollRef = useRef<{ left: number; top: number } | null>(null);

  const applyZoom = (next: number) => {
    const z = clamp(next, MIN_ZOOM, MAX_ZOOM);
    zoomRef.current = z;
    setZoom(z);
  };

  const scaledWidth = Math.round(dims.w * zoom);
  const scaledHeight = Math.round(dims.h * zoom);
  const selectedItem = legend.find((item) => item.id === selectedId);
  const featuredItems = legend.some((item) => item.featured !== undefined)
    ? legend
        .filter((item) => item.featured !== undefined)
        .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0))
    : legend.slice(0, 5);

  // Pixel position of a pin at the current zoom.
  const pinLeft = (item: MapLegendItem) => (item.point.x / 100) * scaledWidth;
  const pinTop = (item: MapLegendItem) => (item.point.y / 100) * scaledHeight;

  const getFitZoom = () => {
    const el = containerRef.current;
    if (!el) return 1;
    const fitWidth = (el.clientWidth - 16) / dims.w;
    const fitHeight = (el.clientHeight - 16) / dims.h;
    return clamp(Math.min(fitWidth, fitHeight), MIN_ZOOM, MAX_ZOOM);
  };

  const setZoomAndScroll = (nextZoom: number, left: number, top: number, behavior: ScrollBehavior = "smooth") => {
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const el = containerRef.current;
    if (!el) {
      applyZoom(z);
      return;
    }

    if (Math.abs(z - zoomRef.current) > 0.001) {
      pendingScrollRef.current = { left, top };
      applyZoom(z);
      return;
    }

    el.scrollTo({
      left: clamp(left, 0, Math.max(0, el.scrollWidth - el.clientWidth)),
      top: clamp(top, 0, Math.max(0, el.scrollHeight - el.clientHeight)),
      behavior,
    });
  };

  const centerMap = (nextZoom = zoomRef.current, behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    setZoomAndScroll(z, (dims.w * z - el.clientWidth) / 2, (dims.h * z - el.clientHeight) / 2, behavior);
  };

  const fitMap = (behavior: ScrollBehavior = "smooth") => {
    const fitZoom = getFitZoom();
    centerMap(fitZoom, behavior);
  };

  const focusVenue = (item: MapLegendItem) => {
    const el = containerRef.current;
    if (!el) return;
    const targetZoom = Math.max(zoomRef.current, 1);
    setSelectedId(item.id);
    setZoomAndScroll(
      targetZoom,
      (item.point.x / 100) * dims.w * targetZoom - el.clientWidth / 2,
      (item.point.y / 100) * dims.h * targetZoom - el.clientHeight / 2,
    );
  };

  // Open in an overview state so the user sees the whole camp before zooming
  // into details. Re-fits when a synced map's real dimensions arrive on load.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      fitMap("auto");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, dims.h]);

  // After every zoom state update: apply pending pinch scroll or preserve button-zoom center.
  // useLayoutEffect runs before paint so scroll is set while the new image dimensions are live.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (pendingScrollRef.current) {
      el.scrollLeft = pendingScrollRef.current.left;
      el.scrollTop = pendingScrollRef.current.top;
      pendingScrollRef.current = null;
    } else if (domZoomRef.current !== zoom) {
      // Button zoom: keep the visible center anchored
      const ratio = zoom / domZoomRef.current;
      const cx = el.scrollLeft + el.clientWidth / 2;
      const cy = el.scrollTop + el.clientHeight / 2;
      el.scrollLeft = cx * ratio - el.clientWidth / 2;
      el.scrollTop = cy * ratio - el.clientHeight / 2;
    }

    domZoomRef.current = zoom;
  }, [zoom]);

  // Pinch-to-zoom anchored under the fingers. Every move re-anchors the map
  // point that is under the fingers *right now*, read from the live scroll
  // position and the current midpoint. That holds whether or not the browser
  // is also panning the scroll container natively during the gesture: a
  // two-finger drag that began as a one-finger scroll can no longer be
  // cancelled, and anchoring on the gesture's *initial* scroll and midpoint
  // (the previous approach) fought that pan and dragged the anchor away from
  // the pinch.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { active: true, startDist: getDist(e.touches), startZoom: zoomRef.current };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current.active) return;
      if (e.cancelable) e.preventDefault();

      const p = pinchRef.current;
      const nextZoom = clamp((p.startZoom * getDist(e.touches)) / p.startDist, MIN_ZOOM, MAX_ZOOM);
      const domZoom = domZoomRef.current;
      if (Math.abs(nextZoom - domZoom) < 0.0005) return;

      const rect = el.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      // Map point (unscaled px) under the fingers, as currently laid out…
      const mapX = (el.scrollLeft + midX) / domZoom;
      const mapY = (el.scrollTop + midY) / domZoom;

      // …kept under the fingers once the image is re-laid out at nextZoom.
      pendingScrollRef.current = { left: mapX * nextZoom - midX, top: mapY * nextZoom - midY };
      zoomRef.current = nextZoom;
      setZoom(nextZoom);
    };

    const onTouchEnd = () => {
      pinchRef.current.active = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <>
      <div className="card overflow-hidden rounded-2xl p-0">
        <div className="border-b border-sky-900/10 bg-linear-to-r from-sky-50 via-white to-orange-50 px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">{eyebrow}</p>
              <h2 className="mt-0.5 text-lg font-black leading-tight text-slate-950">{title}</h2>
            </div>
            <div className="inline-flex h-10 min-w-16 items-center justify-center rounded-full bg-white px-3 text-sm font-black text-[#2f62b6] shadow-sm ring-1 ring-sky-900/10">
              {Math.round(zoom * 100)}%
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fitMap()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-[#2f62b6] shadow-sm ring-1 ring-sky-900/10 transition active:scale-95"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                centerMap(1);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-sky-900/10 transition active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            {legend.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLegend(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-sky-900/10 transition active:scale-95"
              >
                <List className="h-3.5 w-3.5" />
                All venues
              </button>
            )}
          </div>
          <div className={`no-scrollbar mt-3 gap-2 overflow-x-auto pb-1 ${featuredItems.length > 0 ? "flex" : "hidden"}`}>
            {featuredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => focusVenue(item)}
                aria-pressed={selectedId === item.id}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-black shadow-sm ring-1 transition active:scale-95 ${
                  selectedId === item.id
                    ? "bg-[#2f62b6] text-white ring-[#2f62b6]"
                    : "bg-white text-slate-700 ring-sky-900/10"
                }`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-950/30 text-[11px] font-black text-slate-950"
                  style={{ backgroundColor: item.color }}
                >
                  {item.number}
                </span>
                {item.short ?? item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            ref={containerRef}
            className="app-map-scroll relative h-[58vh] min-h-[22rem] max-h-[44rem] overflow-auto bg-[#f3ead8] overscroll-contain"
          >
            <div
              className="relative"
              style={{ width: scaledWidth, height: scaledHeight }}
              onClick={() => setSelectedId(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                width={scaledWidth}
                height={scaledHeight}
                className="absolute inset-0 max-w-none"
                onLoad={(event) => {
                  const img = event.currentTarget;
                  if (!isBuiltin && img.naturalWidth > 0 && (img.naturalWidth !== dims.w || img.naturalHeight !== dims.h)) {
                    setDims({ w: img.naturalWidth, h: img.naturalHeight });
                  }
                }}
              />
              {legend.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedId(item.id);
                  }}
                  aria-label={`Show ${item.name} on map`}
                  aria-describedby={selectedId === item.id ? `map-tooltip-${item.id}` : undefined}
                  className={`absolute z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition active:scale-95 focus-visible:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f62b6] ${
                    selectedId === item.id ? "bg-white/15 ring-2 ring-[#2f62b6]/45" : "bg-transparent"
                  }`}
                  style={{ left: pinLeft(item), top: pinTop(item) }}
                >
                  <span className="sr-only">{item.short ?? item.name}</span>
                </button>
              ))}
              {selectedItem ? (
                <div
                  className="pointer-events-none absolute z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sky-200/25 ring-4 ring-[#2f62b6]/30"
                  style={{ left: pinLeft(selectedItem), top: pinTop(selectedItem) }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 text-sm font-black text-slate-950 shadow-lg"
                    style={{ backgroundColor: selectedItem.color }}
                  >
                    {selectedItem.number}
                  </span>
                </div>
              ) : null}
              {selectedItem ? (
                <div
                  id={`map-tooltip-${selectedItem.id}`}
                  role="tooltip"
                  className="pointer-events-none absolute z-30 w-52 -translate-x-1/2 -translate-y-[calc(100%+1rem)] rounded-xl bg-white px-3 py-2 text-left shadow-xl ring-1 ring-sky-900/10"
                  style={{ left: pinLeft(selectedItem), top: pinTop(selectedItem) }}
                >
                  <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white ring-1 ring-sky-900/10" />
                  <span className="relative flex items-start gap-2">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-950/30 text-xs font-black text-slate-950"
                      style={{ backgroundColor: selectedItem.color }}
                    >
                      {selectedItem.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black leading-tight text-slate-950">{selectedItem.name}</span>
                      {selectedItem.detail ? (
                        <span className="mt-0.5 block whitespace-pre-line text-xs font-semibold leading-snug text-slate-600">
                          {selectedItem.detail}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="absolute bottom-3 right-3 z-20 flex min-h-11 items-center gap-1 rounded-full bg-white/95 p-1 shadow-lg ring-1 ring-sky-900/10 backdrop-blur">
            <button
              type="button"
              onClick={() => applyZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[#2f62b6] transition active:scale-95 disabled:opacity-40"
              aria-label="Zoom out map"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f62b6] text-white transition active:scale-95 disabled:opacity-40"
              aria-label="Zoom in map"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend modal */}
      {showLegend && legend.length > 0 && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-stone-950/40 backdrop-blur-sm"
          onClick={() => setShowLegend(false)}
        >
          <div
            className="card flex max-h-[82vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sky-900/10 p-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">Legend</p>
                <h2 className="mt-0.5 text-xl font-black text-stone-950">Map venues</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition active:scale-95"
                aria-label="Close legend"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2 overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:grid-cols-2">
              {legend.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    focusVenue(item);
                    setShowLegend(false);
                  }}
                  className={`flex min-h-14 items-start gap-3 rounded-xl px-3 py-2.5 text-left transition active:scale-[0.99] ${
                    selectedId === item.id
                      ? "bg-sky-50 ring-2 ring-[#2f62b6]"
                      : "bg-white/86 ring-1 ring-sky-900/10"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-stone-950 text-sm font-black text-stone-950 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.number}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-sm font-black leading-tight text-stone-700">{item.name}</span>
                    {item.detail ? (
                      <span className="mt-0.5 block whitespace-pre-line text-xs font-semibold leading-snug text-stone-500">{item.detail}</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
