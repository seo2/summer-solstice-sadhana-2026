import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLink as Link } from "@/components/app-link";
import { CalendarDays, Heart, Home, Info, Map, Star } from "lucide-react";
import { OfflinePreloader } from "@/components/offline-preloader";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3HO Summer Solstice Sadhana 2026",
  description: "Offline-first PWA program, favorites and personal agenda for Summer Solstice Sadhana 2026.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Summer Solstice 2026",
  },
};

export const viewport: Viewport = {
  themeColor: "#39a9ef",
  viewportFit: "cover",
};

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/program", label: "Program", icon: CalendarDays },
  { href: "/agenda", label: "Agenda", icon: Star },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/info", label: "Info", icon: Info },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
          <header className="sticky top-0 z-40 border-b border-sky-900/10 bg-white/82 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f39200]">3HO</p>
                <p className="text-lg font-bold text-[#2f62b6]">Summer Solstice 2026</p>
              </Link>
              <Link href="/map" className="rounded-full bg-[#2f62b6] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                <Map className="mr-1 inline h-4 w-4" /> Map
              </Link>
            </div>
          </header>
          <main className="safe-bottom flex-1 px-4 pb-5 pt-3">{children}</main>
          <OfflinePreloader />
          <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-3xl border-t border-sky-900/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex flex-col items-center rounded-2xl px-1 py-2 text-[11px] font-semibold text-slate-700 hover:bg-sky-100/70">
                    <Icon className="mb-1 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
