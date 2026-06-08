"use client";

import { Share, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "solstice-install-hint-dismissed";

export function InstallHint() {
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setStandalone(isStandalone);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (standalone || dismissed) return null;

  return (
    <div className="install-hint-card sm:hidden">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#2f62b6] shadow-sm ring-1 ring-sky-200/70">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[#2f62b6]">Add to Home Screen for offline access</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Open once with internet, wait for offline content, then tap <Share className="inline h-3.5 w-3.5" /> Share → Add to Home Screen.</p>
        </div>
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
