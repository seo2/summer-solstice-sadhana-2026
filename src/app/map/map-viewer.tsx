"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAP_WIDTH = 1266;
const MAP_HEIGHT = 1204;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function MapViewer() {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  // refs so touch handlers always see current values without needing re-registration
  const zoomRef = useRef(1);
  const pinchRef = useRef({ dist: 0, startZoom: 1 });

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

  // Keep the visible center stable when zoom changes via buttons
  const prevZoomRef = useRef(1);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prevZoomRef.current === zoom) return;
    const ratio = zoom / prevZoomRef.current;
    const cx = el.scrollLeft + el.clientWidth / 2;
    const cy = el.scrollTop + el.clientHeight / 2;
    requestAnimationFrame(() => {
      el.scrollLeft = cx * ratio - el.clientWidth / 2;
      el.scrollTop = cy * ratio - el.clientHeight / 2;
    });
    prevZoomRef.current = zoom;
  }, [zoom]);

  // Pinch-to-zoom via non-passive touch listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current.dist = getDist(e.touches);
        pinchRef.current.startZoom = zoomRef.current;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const next = clamp(
        pinchRef.current.startZoom * getDist(e.touches) / pinchRef.current.dist,
        MIN_ZOOM,
        MAX_ZOOM
      );
      if (Math.abs(next - zoomRef.current) > 0.02) {
        zoomRef.current = next;
        prevZoomRef.current = next; // skip scroll-center adjustment during pinch
        setZoom(next);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="card rounded-2xl p-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2 pt-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Pinch or scroll to explore</p>
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
  );
}
