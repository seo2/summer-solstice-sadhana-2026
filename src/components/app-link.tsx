"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navDirection, requestRouteExit } from "@/lib/route-transition";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
  prefetch?: boolean | "auto" | null | "unstable_forceStale";
  replace?: boolean;
  scroll?: boolean;
};

/**
 * Every internal navigation in the app goes through this component, which makes
 * it the one place to hang the screen transition on: the current screen plays a
 * short exit, then the router swaps the route (see lib/route-transition.ts).
 *
 * Only a plain left-click is intercepted — modifier and middle clicks, new-tab
 * targets and downloads keep the browser's own behaviour.
 */
export function AppLink({ href, children, prefetch = true, replace, scroll, onClick, ...props }: AppLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isHashOnly = href.startsWith("#");
  const isExternal = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(href) || href.startsWith("//");

  if (isHashOnly || isExternal || props.download) {
    return (
      <a href={href} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    const opensElsewhere =
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (props.target && props.target !== "_self");

    if (opensElsewhere) return;

    event.preventDefault();

    await requestRouteExit(navDirection(pathname, href));

    if (replace) {
      router.replace(href, { scroll });
    } else {
      router.push(href, { scroll });
    }
  }

  return (
    <NextLink href={href} prefetch={prefetch} replace={replace} scroll={scroll} onClick={handleClick} {...props}>
      {children}
    </NextLink>
  );
}
