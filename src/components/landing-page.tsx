"use client";

import { AppLink as Link } from "@/components/app-link";
import { LandingView } from "@/components/landing-view";
import { useHomeLandings } from "@/lib/home-feed";
import { builtinLanding, type Landing } from "@/lib/landings";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Client half of /landing: picks the landing named in the URL hash — a
 * built-in one first, then the Home feed store — and renders the template.
 * Reacts to hash changes (a tile tapped from another landing) and shows a
 * quiet empty state when the id is unknown or nothing was published yet.
 */

function readHashId(): string {
  if (typeof window === "undefined") return "";
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, ""));
  } catch {
    return "";
  }
}

export function LandingPage() {
  const [id, setId] = useState<string | null>(null);
  const synced = useHomeLandings();

  useEffect(() => {
    const update = () => setId(readHashId());
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const landing: Landing | undefined =
    id ? builtinLanding(id) ?? synced?.find((entry) => entry.id === id && entry.status !== "draft") : undefined;

  // No dependency list on purpose: a hash-only navigation makes the router
  // re-apply the route's static <title>, so re-assert the landing's after
  // every render (a string assignment — cheap).
  useEffect(() => {
    if (landing) document.title = `${landing.title} | 3HO Event App`;
  });

  // Hash not read yet, or the store has not answered: render nothing rather than a flash of "not found".
  if (id === null || (id && !landing && synced === undefined)) return null;

  if (!landing) {
    return (
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]">
          <ChevronLeft className="h-4 w-4" />
          Home
        </Link>
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <Sparkles className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">This page is not on your device yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">It will appear here the next time the app refreshes while online.</p>
        </div>
      </div>
    );
  }

  return <LandingView landing={landing} />;
}
