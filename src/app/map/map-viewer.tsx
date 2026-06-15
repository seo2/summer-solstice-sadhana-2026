"use client";

import { List, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MAP_WIDTH = 1266;
const MAP_HEIGHT = 1204;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

const mapLegend = [
  { number: 1, label: "SSS Cabin", shortLabel: "SSS Cabin", color: "#e8a323", point: { x: 434, y: 424 } },
  { number: 2, label: "Cool Room", shortLabel: "Cool Room", color: "#88aa50", point: { x: 574, y: 397 } },
  { number: 3, label: "Admin / Security", shortLabel: "Admin / Security", color: "#f3b6db", point: { x: 601, y: 460 } },
  { number: 4, label: "Showers\nFlush Toilets\nFamily Showers", shortLabel: "Showers", color: "#55c4e6", point: { x: 631, y: 372 } },
  { number: 5, label: "Tantric Shelter", shortLabel: "Tantric", color: "#d97843", point: { x: 914, y: 444 } },
  { number: 6, label: "Atma Shelter", shortLabel: "Atma", color: "#df824f", point: { x: 884, y: 705 } },
  { number: 7, label: "Prem Shelter", shortLabel: "Prem", color: "#dc7840", point: { x: 854, y: 546 } },
  { number: 8, label: "SDI Academy", shortLabel: "SDI", color: "#e47f45", point: { x: 772, y: 770 } },
  { number: 9, label: "Kids Camp", shortLabel: "Kids Camp", color: "#f2dc27", point: { x: 710, y: 918 } },
  { number: 10, label: "First Aid / Hospitality", shortLabel: "First Aid / Hospitality", color: "#e5272f", point: { x: 544, y: 711 } },
  { number: 11, label: "Dining / Bazaar\nRegistration", shortLabel: "Dining", color: "#9c84c5", point: { x: 681, y: 614 } },
  { number: 12, label: "Kitchen", shortLabel: "Kitchen", color: "#c8beb9", point: { x: 556, y: 532 } },
  { number: 13, label: "Adobe Cabins", shortLabel: "Cabins", color: "#ffffff", point: { x: 315, y: 1003 } },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const featuredVenues = [11, 10, 2, 5, 4]
  .map((number) => mapLegend.find((item) => item.number === number))
  .filter((item): item is (typeof mapLegend)[number] => Boolean(item));

export function MapViewer() {
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);

  // Tracks previous zoom for button-zoom center preservation
  const prevZoomRef = useRef(1);
  // Pinch state recorded at touchstart
  const pinchRef = useRef({
    active: false,
    dist: 0,
    startZoom: 1,
    midX: 0,
    midY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });
  // Scroll target set by pinch, applied after the image resizes in layout effect
  const pendingScrollRef = useRef<{ left: number; top: number } | null>(null);

  const applyZoom = (next: number) => {
    const z = clamp(next, MIN_ZOOM, MAX_ZOOM);
    zoomRef.current = z;
    setZoom(z);
  };

  const scaledWidth = Math.round(MAP_WIDTH * zoom);
  const scaledHeight = Math.round(MAP_HEIGHT * zoom);
  const selectedItem = mapLegend.find((item) => item.number === selectedVenue);

  const getFitZoom = () => {
    const el = containerRef.current;
    if (!el) return 1;
    const fitWidth = (el.clientWidth - 16) / MAP_WIDTH;
    const fitHeight = (el.clientHeight - 16) / MAP_HEIGHT;
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
    setZoomAndScroll(z, (MAP_WIDTH * z - el.clientWidth) / 2, (MAP_HEIGHT * z - el.clientHeight) / 2, behavior);
  };

  const fitMap = (behavior: ScrollBehavior = "smooth") => {
    const fitZoom = getFitZoom();
    centerMap(fitZoom, behavior);
  };

  const focusVenue = (item: (typeof mapLegend)[number]) => {
    const el = containerRef.current;
    if (!el) return;
    const targetZoom = Math.max(zoomRef.current, 1);
    setSelectedVenue(item.number);
    setZoomAndScroll(
      targetZoom,
      item.point.x * targetZoom - el.clientWidth / 2,
      item.point.y * targetZoom - el.clientHeight / 2,
    );
  };

  // Open in an overview state so the user sees the whole camp before zooming into details.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      fitMap("auto");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After every zoom state update: apply pending pinch scroll or preserve button-zoom center.
  // useLayoutEffect runs before paint so scroll is set while the new image dimensions are live.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (pendingScrollRef.current) {
      el.scrollLeft = pendingScrollRef.current.left;
      el.scrollTop = pendingScrollRef.current.top;
      pendingScrollRef.current = null;
    } else if (prevZoomRef.current !== zoom) {
      // Button zoom: keep the visible center anchored
      const ratio = zoom / prevZoomRef.current;
      const cx = el.scrollLeft + el.clientWidth / 2;
      const cy = el.scrollTop + el.clientHeight / 2;
      el.scrollLeft = cx * ratio - el.clientWidth / 2;
      el.scrollTop = cy * ratio - el.clientHeight / 2;
    }

    prevZoomRef.current = zoom;
  }, [zoom]);

  // Pinch-to-zoom with focal point anchored to the pinch midpoint
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const rect = el.getBoundingClientRect();
        const midClientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midClientY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        pinchRef.current = {
          active: true,
          dist: getDist(e.touches),
          startZoom: zoomRef.current,
          midX: midClientX - rect.left,
          midY: midClientY - rect.top,
          startScrollLeft: el.scrollLeft,
          startScrollTop: el.scrollTop,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current.active) return;
      e.preventDefault();

      const p = pinchRef.current;
      const newZoom = clamp(p.startZoom * getDist(e.touches) / p.dist, MIN_ZOOM, MAX_ZOOM);
      const ratio = newZoom / p.startZoom;

      // Schedule scroll correction for after the image DOM update
      pendingScrollRef.current = {
        left: (p.startScrollLeft + p.midX) * ratio - p.midX,
        top: (p.startScrollTop + p.midY) * ratio - p.midY,
      };

      zoomRef.current = newZoom;
      setZoom(newZoom);
    };

    const onTouchEnd = () => {
      pinchRef.current.active = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <>
      <div className="card overflow-hidden rounded-2xl p-0">
        <div className="border-b border-sky-900/10 bg-linear-to-r from-sky-50 via-white to-orange-50 px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">Ram Das Puri</p>
              <h2 className="mt-0.5 text-lg font-black leading-tight text-slate-950">Camp orientation</h2>
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
                setSelectedVenue(null);
                centerMap(1);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-sky-900/10 transition active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowLegend(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-sky-900/10 transition active:scale-95"
            >
              <List className="h-3.5 w-3.5" />
              All venues
            </button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {featuredVenues.map((item) => (
              <button
                key={item.number}
                type="button"
                onClick={() => focusVenue(item)}
                aria-pressed={selectedVenue === item.number}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-black shadow-sm ring-1 transition active:scale-95 ${
                  selectedVenue === item.number
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
                {item.shortLabel}
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
              onClick={() => setSelectedVenue(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/camp-map.png"
                alt="Camp map for Summer Solstice 2026"
                width={scaledWidth}
                height={scaledHeight}
                className="absolute inset-0 max-w-none"
              />
              {mapLegend.map((item) => (
                <button
                  key={item.number}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedVenue(item.number);
                  }}
                  aria-label={`Show ${item.label.replace(/\n/g, ", ")} on map`}
                  aria-describedby={selectedVenue === item.number ? `map-tooltip-${item.number}` : undefined}
                  className={`absolute z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition active:scale-95 focus-visible:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f62b6] ${
                    selectedVenue === item.number ? "bg-white/15 ring-2 ring-[#2f62b6]/45" : "bg-transparent"
                  }`}
                  style={{ left: item.point.x * zoom, top: item.point.y * zoom }}
                >
                  <span className="sr-only">{item.shortLabel}</span>
                </button>
              ))}
              {selectedItem ? (
                <div
                  className="pointer-events-none absolute z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sky-200/25 ring-4 ring-[#2f62b6]/30"
                  style={{ left: selectedItem.point.x * zoom, top: selectedItem.point.y * zoom }}
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
                  id={`map-tooltip-${selectedItem.number}`}
                  role="tooltip"
                  className="pointer-events-none absolute z-30 w-52 -translate-x-1/2 -translate-y-[calc(100%+1rem)] rounded-xl bg-white px-3 py-2 text-left shadow-xl ring-1 ring-sky-900/10"
                  style={{ left: selectedItem.point.x * zoom, top: selectedItem.point.y * zoom }}
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
                      <span className="block text-sm font-black leading-tight text-slate-950">{selectedItem.shortLabel}</span>
                      <span className="mt-0.5 block whitespace-pre-line text-xs font-semibold leading-snug text-slate-600">
                        {selectedItem.label}
                      </span>
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
      {showLegend && (
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
              {mapLegend.map((item) => (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => {
                    focusVenue(item);
                    setShowLegend(false);
                  }}
                  className={`flex min-h-14 items-start gap-3 rounded-xl px-3 py-2.5 text-left transition active:scale-[0.99] ${
                    selectedVenue === item.number
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
                  <span className="whitespace-pre-line pt-0.5 text-sm font-black leading-tight text-stone-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
