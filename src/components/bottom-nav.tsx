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

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-3xl border-t border-sky-900/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-sky-100/80 text-[#2f62b6]"
                  : "text-slate-500 hover:bg-sky-100/70 hover:text-slate-700"
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
