import type { AnchorHTMLAttributes, ReactNode } from "react";
import NextLink from "next/link";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
  prefetch?: boolean | "auto" | null | "unstable_forceStale";
  replace?: boolean;
  scroll?: boolean;
};

export function AppLink({ href, children, prefetch = true, replace, scroll, ...props }: AppLinkProps) {
  const isHashOnly = href.startsWith("#");
  const isExternal = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(href) || href.startsWith("//");

  if (isHashOnly || isExternal || props.download) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} prefetch={prefetch} replace={replace} scroll={scroll} {...props}>
      {children}
    </NextLink>
  );
}
