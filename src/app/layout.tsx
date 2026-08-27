import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLink as Link } from "@/components/app-link";
import { OfflinePreloader } from "@/components/offline-preloader";
import { BottomNav } from "@/components/bottom-nav";
import { WomensRenewalReminder } from "@/components/womens-renewal-reminder";
import { NavigationWarmup } from "@/components/navigation-warmup";
import { RouteTransitionShell } from "@/components/route-transition-shell";
import { ContactOutboxSync } from "@/components/contact-outbox-sync";
import { FavoritesSyncAgent } from "@/components/favorites-sync-agent";
import { AccountButton } from "@/components/account-button";
import { ReminderAgent } from "@/components/reminder-agent";
import { PushAgent } from "@/components/push-agent";
import { UpdateAgent } from "@/components/update-agent";
import { AlertsAgent } from "@/components/alerts-agent";
import { AnnouncementsBell } from "@/components/announcements-bell";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3HO Event App",
  description: "Offline-first program, favorites and personal agenda for 3HO events.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "3HO Events",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#39a9ef",
  viewportFit: "cover",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
          <header className="sticky top-0 z-40 border-b border-sky-900/10 bg-white/82 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f39200]">3HO</p>
                <p className="text-lg font-bold text-[#2f62b6]">Event App</p>
              </Link>
              <div className="flex items-center gap-1">
                <AnnouncementsBell />
                <AccountButton />
              </div>
            </div>
          </header>
          <main className="safe-bottom flex-1 px-4 pb-5 pt-3">
            <RouteTransitionShell>{children}</RouteTransitionShell>
          </main>
          <NavigationWarmup />
          <ContactOutboxSync />
          <FavoritesSyncAgent />
          <ReminderAgent />
          <PushAgent />
          <UpdateAgent />
          <AlertsAgent />
          <OfflinePreloader />
          <WomensRenewalReminder />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
