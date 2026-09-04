import infoPages from "@/data/info-pages.json";
import { InfoHub, InstallHintLink } from "@/components/info-hub";
import { SyncedInfoGate } from "@/components/synced-info";
import { ScheduleNoticeCard } from "@/components/schedule-notice";
import type { InfoPage } from "@/lib/types";

/**
 * Info Hub for the built-in Summer Solstice booklet content. The body
 * (topic grid, groups, page and section cards) is the shared `InfoHub`;
 * `SyncedInfoGate` swaps in the active synced event's pages instead.
 */
export default function InfoPage() {
  return (
    <SyncedInfoGate>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-xl bg-[#2f62b6] p-5 text-white shadow-xl">
          <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-[#f39200]/25 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-100">Offline info</p>
            <h1 className="mt-2 text-4xl font-black leading-none">Info Hub</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50/90">
              Essential program information grouped by topic so you can quickly find what you need during the festival, even offline.
            </p>
          </div>
        </section>

        <ScheduleNoticeCard />

        <InstallHintLink />

        <InfoHub pages={infoPages as InfoPage[]} />
      </div>
    </SyncedInfoGate>
  );
}
