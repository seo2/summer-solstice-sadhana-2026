"use client";

import { List, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------
  // Viewport model. The map content is positioned with a CSS transform, not
  // with native scrolling: `offset` is how many (scaled) pixels of the map are
  // hidden to the left/top of the viewport — the scroll position it replaces.
  // Native overflow scrolling was the source of every touch bug here: iOS
  // ignores programmatic scroll writes while a finger is down on the
  // scroller (the pan never moved) and while a native gesture is in flight
  // (the pinch scaled from the corner). Transforms are always honoured.
  // ---------------------------------------------------------------------
  const zoomRef = useRef(1); // latest requested zoom
  const domZoomRef = useRef(1); // zoom the DOM currently reflects (set after commit)
  const dimsRef = useRef(dims);
  const offsetRef = useRef({ x: 0, y: 0 });
  // Offset to apply once the content is laid out at the newly requested zoom.
  const pendingOffsetRef = useRef<{ x: number; y: number; animate: boolean } | null>(null);
  // Running fling animation (requestAnimationFrame id), 0 when idle.
  const flingRef = useRef(0);
  dimsRef.current = dims;

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

  const stopFling = () => {
    if (flingRef.current) {
      cancelAnimationFrame(flingRef.current);
      flingRef.current = 0;
    }
  };

  /** Keep the map inside the viewport; a map smaller than the viewport sits centered. */
  const clampOffset = (x: number, y: number, z: number) => {
    const el = containerRef.current;
    if (!el) return { x, y };
    const w = dimsRef.current.w * z;
    const h = dimsRef.current.h * z;
    return {
      x: w <= el.clientWidth ? (w - el.clientWidth) / 2 : clamp(x, 0, w - el.clientWidth),
      y: h <= el.clientHeight ? (h - el.clientHeight) / 2 : clamp(y, 0, h - el.clientHeight),
    };
  };

  /** Move the map. `z` is the zoom the content is laid out at (defaults to what the DOM shows). */
  const applyOffset = (x: number, y: number, z = domZoomRef.current, animate = false) => {
    const el = contentRef.current;
    if (!el) return;
    const next = clampOffset(x, y, z);
    offsetRef.current = next;
    el.style.transition = animate ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    el.style.transform = `translate3d(${-next.x}px, ${-next.y}px, 0)`;
  };

  /**
   * Zoom so that map point `anchor` (unscaled px) ends up under viewport
   * point `screen`. When the zoom actually changes, the move waits for React
   * to lay the content out at the new size (see the layout effect).
   */
  const setZoomAt = (nextZoom: number, anchor: { x: number; y: number }, screen: { x: number; y: number }, animate = false) => {
    stopFling();
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const target = { x: anchor.x * z - screen.x, y: anchor.y * z - screen.y };
    if (Math.abs(z - zoomRef.current) > 0.0005) {
      pendingOffsetRef.current = { ...target, animate };
      zoomRef.current = z;
      setZoom(z);
      return;
    }
    applyOffset(target.x, target.y, z, animate);
  };

  const viewportCenter = () => {
    const el = containerRef.current;
    return el ? { x: el.clientWidth / 2, y: el.clientHeight / 2 } : { x: 0, y: 0 };
  };

  /** Map point (unscaled px) currently under a viewport point. */
  const mapPointAt = (screen: { x: number; y: number }) => ({
    x: (offsetRef.current.x + screen.x) / domZoomRef.current,
    y: (offsetRef.current.y + screen.y) / domZoomRef.current,
  });

  /** Button zoom: keep whatever is at the center of the viewport centered. */
  const applyZoom = (next: number) => {
    const center = viewportCenter();
    setZoomAt(next, mapPointAt(center), center);
  };

  const getFitZoom = () => {
    const el = containerRef.current;
    if (!el) return 1;
    const fitWidth = (el.clientWidth - 16) / dims.w;
    const fitHeight = (el.clientHeight - 16) / dims.h;
    return clamp(Math.min(fitWidth, fitHeight), MIN_ZOOM, MAX_ZOOM);
  };

  const centerMap = (nextZoom = zoomRef.current, animate = true) => {
    setZoomAt(nextZoom, { x: dims.w / 2, y: dims.h / 2 }, viewportCenter(), animate);
  };

  const fitMap = (animate = true) => {
    centerMap(getFitZoom(), animate);
  };

  const focusVenue = (item: MapLegendItem) => {
    setSelectedId(item.id);
    setZoomAt(
      Math.max(zoomRef.current, 1),
      { x: (item.point.x / 100) * dims.w, y: (item.point.y / 100) * dims.h },
      viewportCenter(),
      true,
    );
  };

  // Open in an overview state so the user sees the whole camp before zooming
  // into details. Re-fits when a synced map's real dimensions arrive on load.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      fitMap(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w, dims.h]);

  // After every zoom commit the content has its new size: apply the offset
  // that was computed for it (pinch / focus / fit), or — for a zoom change
  // that carried no target — keep the visible center anchored. Also re-clamps
  // when the map's dimensions change.
  useLayoutEffect(() => {
    const pending = pendingOffsetRef.current;
    if (pending) {
      pendingOffsetRef.current = null;
      applyOffset(pending.x, pending.y, zoom, pending.animate);
    } else if (domZoomRef.current !== zoom) {
      const center = viewportCenter();
      const ratio = zoom / domZoomRef.current;
      const o = offsetRef.current;
      applyOffset((o.x + center.x) * ratio - center.x, (o.y + center.y) * ratio - center.y, zoom);
    } else {
      applyOffset(offsetRef.current.x, offsetRef.current.y, zoom);
    }
    domZoomRef.current = zoom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, dims.w, dims.h]);

  // Keep the map in bounds when the viewport changes size (rotation, resize).
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => applyOffset(offsetRef.current.x, offsetRef.current.y));
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch gestures — the viewer owns them all (`.app-map-scroll` sets
  // `touch-action: none`): one finger pans, two fingers pinch-zoom anchored
  // under the fingers (and pan as they move), and letting go after a pan
  // flings with the finger's velocity.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    type Gesture = {
      mode: "none" | "pan" | "pinch";
      lastX: number;
      lastY: number;
      lastT: number;
      vx: number; // offset velocity, px per ms
      vy: number;
      startDist: number;
      startZoom: number;
      anchorX: number; // map point (unscaled px) under the pinch midpoint
      anchorY: number;
    };
    const g: Gesture = { mode: "none", lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0, startDist: 0, startZoom: 1, anchorX: 0, anchorY: 0 };

    const getDist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const local = (t: Touch) => {
      const rect = el.getBoundingClientRect();
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };

    const beginPan = (t: Touch, time: number) => {
      const p = local(t);
      g.mode = "pan";
      g.lastX = p.x;
      g.lastY = p.y;
      g.lastT = time;
      g.vx = 0;
      g.vy = 0;
    };

    const beginPinch = (touches: TouchList) => {
      const a = local(touches[0]);
      const b = local(touches[1]);
      const anchor = mapPointAt({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      g.mode = "pinch";
      g.startDist = getDist(touches);
      g.startZoom = zoomRef.current;
      g.anchorX = anchor.x;
      g.anchorY = anchor.y;
    };

    const fling = () => {
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(now - last, 50);
        last = now;
        const before = offsetRef.current;
        applyOffset(before.x + g.vx * dt, before.y + g.vy * dt);
        const after = offsetRef.current;
        const decay = Math.pow(0.994, dt);
        g.vx = after.x === before.x ? 0 : g.vx * decay; // hit an edge: stop on that axis
        g.vy = after.y === before.y ? 0 : g.vy * decay;
        flingRef.current = Math.abs(g.vx) > 0.01 || Math.abs(g.vy) > 0.01 ? requestAnimationFrame(step) : 0;
      };
      flingRef.current = requestAnimationFrame(step);
    };

    const onTouchStart = (e: TouchEvent) => {
      stopFling();
      if (e.touches.length === 1) beginPan(e.touches[0], e.timeStamp);
      else if (e.touches.length >= 2) beginPinch(e.touches);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (g.mode === "none") return;
      if (e.cancelable) e.preventDefault();

      if (g.mode === "pan" && e.touches.length === 1) {
        const p = local(e.touches[0]);
        const dx = p.x - g.lastX;
        const dy = p.y - g.lastY;
        const dt = e.timeStamp - g.lastT;
        applyOffset(offsetRef.current.x - dx, offsetRef.current.y - dy);
        if (dt > 0) {
          // Smoothed velocity in offset units so the fling continues the motion.
          g.vx = 0.7 * g.vx + 0.3 * (-dx / dt);
          g.vy = 0.7 * g.vy + 0.3 * (-dy / dt);
        }
        g.lastX = p.x;
        g.lastY = p.y;
        g.lastT = e.timeStamp;
        return;
      }

      if (g.mode === "pinch" && e.touches.length >= 2) {
        const a = local(e.touches[0]);
        const b = local(e.touches[1]);
        const nextZoom = (g.startZoom * getDist(e.touches)) / g.startDist;
        setZoomAt(nextZoom, { x: g.anchorX, y: g.anchorY }, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        beginPinch(e.touches);
      } else if (e.touches.length === 1) {
        // One finger left after a pinch (or a stray touch): keep panning from it.
        beginPan(e.touches[0], e.timeStamp);
      } else {
        const wasPan = g.mode === "pan";
        g.mode = "none";
        if (wasPan && (Math.abs(g.vx) > 0.05 || Math.abs(g.vy) > 0.05)) fling();
      }
    };

    // Desktop: wheel / trackpad pans; ctrl+wheel (trackpad pinch) zooms at the cursor.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopFling();
      const rect = el.getBoundingClientRect();
      const at = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (e.ctrlKey) {
        setZoomAt(zoomRef.current * Math.exp(-e.deltaY * 0.01), mapPointAt(at), at);
        return;
      }
      applyOffset(offsetRef.current.x + e.deltaX, offsetRef.current.y + e.deltaY);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      stopFling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Desktop: drag with the mouse to pan. A drag must not read as a click on
  // the map (which clears the selected pin).
  const mouseDrag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    stopFling();
    mouseDrag.current = { x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = mouseDrag.current;
    if (!d || e.pointerType !== "mouse") return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    applyOffset(offsetRef.current.x - dx, offsetRef.current.y - dy);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const d = mouseDrag.current;
    mouseDrag.current = null;
    if (d?.moved) suppressClickRef.current = true;
  };
  const suppressClickRef = useRef(false);
  const onContentClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setSelectedId(null);
  };

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
            className="app-map-scroll relative h-[58vh] min-h-[22rem] max-h-[44rem] cursor-grab overflow-hidden bg-[#f3ead8] active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              ref={contentRef}
              className="absolute left-0 top-0 will-change-transform"
              style={{ width: scaledWidth, height: scaledHeight }}
              onClick={onContentClick}
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
