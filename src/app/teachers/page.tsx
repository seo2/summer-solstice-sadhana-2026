import type { Metadata } from "next";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { TeachersView } from "@/components/teachers-view";

export const metadata: Metadata = {
  title: "Teachers · Summer Solstice Sadhana 2026",
  description: "Meet the teachers and facilitators of Summer Solstice Sadhana 2026 and find the sessions they lead.",
};

export default function TeachersPage() {
  return (
    <div className="space-y-4">
      <ActiveEventBanner />
      <section className="pt-1">
        <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Bios & Sessions</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Teachers</h1>
        <p className="mt-1 text-sm font-semibold text-stone-600">Tap a teacher to see who they are and the sessions they lead.</p>
      </section>

      <TeachersView />
    </div>
  );
}
