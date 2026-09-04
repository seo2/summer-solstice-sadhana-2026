"use client";

import { usePathname } from "next/navigation";
import { AppLink as Link } from "@/components/app-link";
import { CalendarDays, Heart, Home, Info, Map, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/program", label: "Program", icon: CalendarDays },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/info", label: "Info", icon: Info },
  { href: "/map", label: "Map", icon: Map },
  { href: "/contact", label: "Contact", icon: MessageCircle },
];

/** Matches `gap-1` on the grid below; the pill's geometry is derived from it. */
const GAP = "0.25rem";

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // -1 on screens that are not tabs (Account, Teachers, Menus…), which hides
  // the pill rather than parking it on an unrelated tab.
  const activeIndex = navItems.findIndex((item) => isActive(item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-3xl border-t border-sky-900/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl">
      <div className="relative grid grid-cols-6 gap-1">
        {/*
          One pill that slides between tabs, instead of each button fading its
          own background: a single object moving reads as one gesture, and it
          shows where you came from. Its width is a grid cell —
          (100% - 5 gaps) / 6 — so translating by (100% + gap) per column lands
          it exactly on the next one.
        */}
        <span
          aria-hidden
          className="nav-pill"
          style={{
            width: `calc((100% - 5 * ${GAP}) / 6)`,
            transform: `translateX(calc((100% + ${GAP}) * ${Math.max(activeIndex, 0)}))`,
            opacity: activeIndex === -1 ? 0 : 1,
          }}
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative z-10 flex flex-col items-center rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors ${
                active ? "text-[#2f62b6]" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="mb-1 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
