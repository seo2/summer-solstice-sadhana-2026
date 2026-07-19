"use client";

import program from "@/data/program.json";
import teachers from "@/data/teachers.json";
import type { Activity, Teacher } from "@/lib/types";
import { CheckCircle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const CACHE_NAME = "solstice-full-offline-v46";
const STORAGE_KEY = "solstice-full-offline-v46-complete";
const DISMISSED_KEY = "solstice-full-offline-v46-dismissed";
const OLD_CACHE_PREFIX = "solstice-full-offline-";
const CONCURRENCY = 6;

const staticPageRoutes = ["/", "/program", "/teachers", "/favorites", "/info", "/map", "/contact", "/womens-renewal", "/install"];
const staticRoutes = [...staticPageRoutes, "/manifest.webmanifest"];
const staticAssets = [
  "/images/solstice-cover-top.jpg",
  "/images/solstice-cover.jpg",
  "/images/camp-map.png",
  "/images/icon.png",
  "/images/womens-renewal/hero.jpg",
  "/images/womens-renewal/circle.jpg",
  "/images/womens-renewal/shakta-kaur.jpg",
  "/images/womens-renewal/rupinder-kaur.jpg",
  "/images/womens-renewal/Nam-Hari-Kaur.jpg",
  "/images/womens-renewal/satbachankaur.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/womens-renewal-2026.ics",
];

function routePayloadUrl(route: string) {
  if (route === "/") return "/index.txt";
  return `${route.replace(/\/$/, "")}.txt`;
}

async function waitForServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration | null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
    ]);
    if (registration?.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
  } catch {
    // Cache API still works without a ready service worker.
  }
}

async function deleteOldOfflineCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith(OLD_CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)),
  );
}

function extractStaticAssets(html: string) {
  const urls = new Set<string>();
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (value.startsWith("/_next/static/") || value.startsWith("/images/") || value.startsWith("/icons/")) {
      urls.add(value);
    }
  }
  return Array.from(urls);
}

async function warmAsset(cache: Cache, url: string) {
  try {
    if (await cache.match(url)) return true;
    const response = await fetch(new Request(url, { cache: "reload" }));
    if (response.ok) await cache.put(url, response.clone());
    return response.ok;
  } catch {
    return false;
  }
}

async function warmUrl(cache: Cache, url: string) {
  const isRoute = url === "/" || !url.includes(".");
  const request = new Request(url, {
    cache: "reload",
    headers: isRoute ? { Accept: "text/html,application/xhtml+xml" } : undefined,
  });
  const response = await fetch(request);
  const contentType = response.headers.get("content-type") ?? "";
  if (response.ok && (!isRoute || contentType.includes("text/html"))) {
    await cache.put(url, response.clone());
    if (isRoute) {
      const html = await response.clone().text();
      const assets = extractStaticAssets(html);
      await Promise.all(assets.map((assetUrl) => warmAsset(cache, assetUrl)));
    }
  }
  return response.ok;
}

async function warmOfflineCache(urls: string[], onProgress: (completed: number, total: number) => void) {
  await waitForServiceWorker();
  await deleteOldOfflineCaches();
  const cache = await caches.open(CACHE_NAME);
  let completed = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor];
      cursor += 1;
      try {
        await warmUrl(cache, url);
      } catch {
        // Keep going — a single failed route should not block the rest.
      } finally {
        completed += 1;
        onProgress(completed, urls.length);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()));
}

function SplashScreen({
  percent,
  completed,
  total,
  fading,
}: {
  percent: number;
  completed: number;
  total: number;
  fading: boolean;
}) {
  const done = percent >= 100;
  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Logo + branding */}
      <div className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/icon.png"
          alt="3HO"
          width={96}
          height={96}
          className="mb-5 h-24 w-24 object-contain"
        />
        <p className="text-xs font-bold uppercase tracking-[0.45em] text-[#f39200]">3HO</p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight text-[#2f62b6]">Summer Solstice</h1>
        <p className="mt-1 text-lg font-semibold text-stone-500">Sadhana 2026</p>
      </div>

      {/* Progress */}
      <div className="mt-12 w-64">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            {done ? "Ready for offline use!" : "Preparing offline content…"}
          </span>
          <span className="text-[11px] font-black text-[#2f62b6]">{percent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-[#f39200] transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-stone-300">
          {completed} / {total} files
        </p>
      </div>

      {/* Bottom tagline */}
      <p className="absolute bottom-10 text-[11px] text-stone-300">Ram Das Puri · New Mexico</p>
    </div>
  );
}

export function OfflinePreloader() {
  const [status, setStatus] = useState<"idle" | "warming" | "complete" | "unsupported">("idle");
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [splashFading, setSplashFading] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  // True if this page session triggered a cache warm (i.e. first install or cache cleared)
  const hadSplash = useRef(false);

  useEffect(() => {
    (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })?.lock?.("portrait").catch(() => {});
  }, []);

  const urls = useMemo(() => {
    const detailRoutes = [
      ...(program as Activity[]).map((activity) => `/program/${activity.id}`),
      ...(teachers as Teacher[]).map((teacher) => `/teachers/${teacher.id}`),
    ];
    const pageRoutes = [...staticPageRoutes, ...detailRoutes];
    const routePayloads = process.env.NODE_ENV === "production" ? pageRoutes.map(routePayloadUrl) : [];
    return Array.from(new Set([...staticRoutes, ...detailRoutes, ...routePayloads, ...staticAssets]));
  }, []);

  useEffect(() => {
    if (!("caches" in window)) {
      setStatus("unsupported");
      return;
    }

    const alreadyComplete = localStorage.getItem(STORAGE_KEY) === "true";
    if (alreadyComplete) {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
      setStatus("complete");
      return;
    }

    hadSplash.current = true;
    let cancelled = false;
    setStatus("warming");
    setProgress({ completed: 0, total: urls.length });

    warmOfflineCache(urls, (completed, total) => {
      if (!cancelled) setProgress({ completed, total });
    }).then(() => {
      if (cancelled) return;
      localStorage.setItem(STORAGE_KEY, "true");
      setStatus("complete");
      // Hold 100% briefly so the user sees completion, then fade out
      setTimeout(() => setSplashFading(true), 900);
      setTimeout(() => setSplashDone(true), 1700);
    });

    return () => {
      cancelled = true;
    };
  }, [urls]);

  // Show splash while warming or during its fade-out
  if (hadSplash.current && !splashDone) {
    const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
    return (
      <SplashScreen
        percent={status === "complete" ? 100 : percent}
        completed={progress.completed}
        total={progress.total}
        fading={splashFading}
      />
    );
  }

  if (status === "unsupported" || status === "idle") return null;

  // "Offline ready" banner — shown on subsequent visits if not yet dismissed.
  // Skipped if this session already showed the splash (the splash communicates completion).
  if (status === "complete" && !hadSplash.current) {
    if (dismissed) return null;
    return (
      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto flex max-w-3xl items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-2xl">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <span className="min-w-0 flex-1">Offline content ready on this device.</span>
        <button
          type="button"
          aria-label="Dismiss offline ready message"
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, "true");
            setDismissed(true);
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}
