"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const primaryRoutes = ["/", "/program", "/favorites", "/info", "/map", "/contact", "/womens-renewal"];

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
