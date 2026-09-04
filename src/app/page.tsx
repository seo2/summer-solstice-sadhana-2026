import { InstallHint } from "@/components/install-hint";
import { HomeEvents } from "@/components/home-events";
import { HomeAnnouncements } from "@/components/home-announcements";
import { HomeNews } from "@/components/home-news";

/**
 * Home — the app's front door, one level above any event. Every event 3HO
 * publishes (with the one being viewed marked), the latest announcements for
 * that event, and news & posts. Opening an event leads to its own home at
 * /event. Everything reads from the local store: a fresh install with no
 * connectivity sees the built-in Summer Solstice as the only event and no
 * posts, and stays fully usable.
 */

export default function Home() {
  return (
    <div className="space-y-5">
      <section className="pt-1">
        <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">3HO Event App</p>
        <h1 className="mt-1 bg-gradient-to-r from-[#2f62b6] to-[#39a9ef] bg-clip-text text-[2.75rem] font-black leading-none tracking-tight text-transparent">Sat Nam</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
          Programs, maps, menus and announcements for 3HO gatherings — saved on your phone, no signal needed.
        </p>
      </section>

      <HomeEvents />

      <InstallHint />

      <HomeAnnouncements showEvent />

      <HomeNews />
    </div>
  );
}
