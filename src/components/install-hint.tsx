"use client";

import { ChevronRight, MoreVertical, Share, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/app-link";

const DISMISS_KEY = "solstice-install-hint-dismissed";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export function InstallHint() {
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setStandalone(isStandalone);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    setPlatform(detectPlatform());
  }, []);

  if (standalone || dismissed) return null;

  const isIos = platform === "ios";
  const isAndroid = platform === "android";

  const title = isAndroid ? "Install app for offline access" : "Add to Home Screen for offline access";

  const instruction = isIos ? (
    <>
      Tap <Share className="inline h-3.5 w-3.5 align-text-bottom" /> <strong>Share</strong> → <strong>Add to Home Screen</strong>.
    </>
  ) : isAndroid ? (
    <>
      Tap <MoreVertical className="inline h-3.5 w-3.5 align-text-bottom" /> menu → <strong>Add to Home Screen</strong> or <strong>Install app</strong>.
    </>
  ) : (
    <>
      Open in your mobile browser and use the share or browser menu to <strong>Add to Home Screen</strong>.
    </>
  );

  return (
    <div className="install-hint-card sm:hidden">
      <div className="flex items-start gap-3">
        <Link href="/install" className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#2f62b6] shadow-sm ring-1 ring-sky-200/70">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#2f62b6]">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{instruction}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-black text-[#2f62b6]">
              See step-by-step guide
              <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Dismiss install hint"
          className="rounded-full bg-white/70 p-2 text-slate-500 shadow-sm ring-1 ring-sky-200/70"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "true");
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
