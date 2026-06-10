"use client";

import { List, Minus, Plus, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MAP_WIDTH = 1266;
const MAP_HEIGHT = 1204;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
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

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function MapViewer() {
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
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

  // Center the map on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    });
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
      <div className="card rounded-2xl p-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2 pt-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Pinch or scroll to explore</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLegend(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-600 shadow-sm ring-1 ring-sky-900/10"
            >
              <List className="h-3.5 w-3.5" />
              Legend
            </button>
            <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-sky-900/10">
              <button
                type="button"
                onClick={() => applyZoom(zoom - ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[#2f62b6] disabled:opacity-40"
                aria-label="Zoom out map"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-xs font-black text-stone-600">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => applyZoom(zoom + ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f62b6] text-white disabled:opacity-40"
                aria-label="Zoom in map"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={containerRef}
          className="app-map-scroll max-h-[70vh] overflow-auto rounded-xl bg-white overscroll-contain"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/camp-map.png"
            alt="Camp map for Summer Solstice 2026"
            width={Math.round(MAP_WIDTH * zoom)}
            height={Math.round(MAP_HEIGHT * zoom)}
            className="max-w-none rounded-xl"
          />
        </div>
      </div>

      {/* Legend modal */}
      {showLegend && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-stone-950/40 backdrop-blur-sm"
          onClick={() => setShowLegend(false)}
        >
          <div
            className="card w-full max-w-lg rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-stone-950">Map Legend</h2>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500"
                aria-label="Close legend"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
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
          </div>
        </div>
      )}
    </>
  );
}
