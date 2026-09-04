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
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Sat Nam</h1>
        <p className="mt-1 text-sm font-semibold leading-6 text-stone-600">
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
