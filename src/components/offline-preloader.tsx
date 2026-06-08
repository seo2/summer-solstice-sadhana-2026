"use client";

import program from "@/data/program.json";
import type { Activity } from "@/lib/types";
import { CheckCircle, DownloadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CACHE_NAME = "solstice-full-offline-v3";
const STORAGE_KEY = "solstice-full-offline-v3-complete";
const CONCURRENCY = 6;

const staticRoutes = ["/", "/program", "/agenda", "/favorites", "/info", "/map", "/manifest.webmanifest"];
const staticAssets = ["/images/solstice-cover-top.jpg", "/images/solstice-cover.jpg", "/icons/icon-192.svg", "/icons/icon-512.svg"];

async function waitForServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration | null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
    ]);
    if (registration?.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
  } catch {
    // The Cache API still works without a ready service worker, so do not block the warmup.
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
  if (response.ok && (!isRoute || contentType.includes("text/html"))) await cache.put(url, response.clone());
  return response.ok;
}

async function warmOfflineCache(urls: string[], onProgress: (completed: number, total: number) => void) {
  await waitForServiceWorker();
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
        // Keep going. A single failed route should not prevent the rest of the app from becoming available offline.
      } finally {
        completed += 1;
        onProgress(completed, urls.length);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()));
}

export function OfflinePreloader() {
  const [status, setStatus] = useState<"idle" | "warming" | "complete" | "unsupported">("idle");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const urls = useMemo(() => {
    const detailRoutes = (program as Activity[]).map((activity) => `/program/${activity.id}`);
    return Array.from(new Set([...staticRoutes, ...detailRoutes, ...staticAssets]));
  }, []);

  useEffect(() => {
    if (!("caches" in window)) {
      setStatus("unsupported");
      return;
    }

    const alreadyComplete = localStorage.getItem(STORAGE_KEY) === "true";
    if (alreadyComplete) {
      setStatus("complete");
      return;
    }

    let cancelled = false;
    setStatus("warming");
    setProgress({ completed: 0, total: urls.length });

    warmOfflineCache(urls, (completed, total) => {
      if (!cancelled) setProgress({ completed, total });
    }).then(() => {
      if (cancelled) return;
      localStorage.setItem(STORAGE_KEY, "true");
      setStatus("complete");
    });

    return () => {
      cancelled = true;
    };
  }, [urls]);

  if (status === "unsupported" || status === "idle") return null;

  if (status === "complete") {
    return (
      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto flex max-w-3xl items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-2xl">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <span>Offline content ready on this device.</span>
      </div>
    );
  }

  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto max-w-3xl rounded-2xl bg-[#2f62b6] p-4 text-white shadow-2xl">
      <div className="flex items-center gap-3">
        <DownloadCloud className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Preparing offline access</p>
          <p className="text-xs text-sky-100">Keep this page open once while connected: {progress.completed}/{progress.total} files</p>
        </div>
        <span className="text-sm font-black">{percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-[#f39200] transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
