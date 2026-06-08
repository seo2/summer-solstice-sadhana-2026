"use client";

import { Share } from "lucide-react";
import { useEffect, useState } from "react";

export function InstallHint() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setStandalone(isStandalone);
  }, []);

  if (standalone) return null;

  return (
    <div className="card rounded-3xl p-4">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-800">Offline tip</p>
      <h2 className="mt-1 text-xl font-bold text-stone-950">Add to Home Screen before arriving</h2>
      <p className="mt-2 text-sm leading-6 text-stone-700">Open this app once with internet and wait until the “Offline content ready” message appears. Then use your browser menu to install it. On iPhone: tap <Share className="inline h-4 w-4" /> Share, then “Add to Home Screen”. Favorites and My Agenda are saved locally on this phone.</p>
    </div>
  );
}
