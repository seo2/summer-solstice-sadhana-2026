"use client";

import { builtinLandings } from "@/lib/landings";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const primaryRoutes = [
  "/",
  "/event",
  "/program",
  "/favorites",
  "/info",
  "/map",
  "/contact",
  ...builtinLandings.map((landing) => landing.path).filter((path): path is string => typeof path === "string"),
];

export function NavigationWarmup() {
  const router = useRouter();

  useEffect(() => {
    const warm = () => {
      for (const route of primaryRoutes) {
        router.prefetch(route);
      }
    };

    const id = window.setTimeout(warm, 350);
    return () => window.clearTimeout(id);
  }, [router]);

  return null;
}
