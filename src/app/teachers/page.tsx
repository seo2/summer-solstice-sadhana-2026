import type { Metadata } from "next";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { TeacherQuickView } from "@/components/teacher-quick-view";
import { sessionSummariesForTeacher, teachers } from "@/lib/teachers";

export const metadata: Metadata = {
  title: "Teachers · Summer Solstice Sadhana 2026",
  description: "Meet the teachers and facilitators of Summer Solstice Sadhana 2026 and find the sessions they lead.",
};

export default function TeachersPage() {
  return (
    <div className="space-y-4">
      <section className="pt-1">
        <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Bios & Sessions</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Teachers</h1>
        <p className="mt-1 text-sm font-semibold text-stone-600">Tap a teacher to see who they are and the sessions they lead.</p>
      </section>

      <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {teachers.map((teacher) => {
          const sessions = sessionSummariesForTeacher(teacher);
          return (
            <TeacherQuickView
              key={teacher.id}
              teacher={teacher}
              sessions={sessions}
              className="activity-list-card flex flex-col items-center gap-2.5 rounded-2xl p-4 text-center transition-transform duration-150 active:scale-[0.99]"
            >
              <TeacherAvatar teacher={teacher} size="lg" />
              <span className="block">
                <span className="block text-[15px] font-black leading-tight tracking-[-0.01em] text-slate-900">{teacher.name}</span>
                {teacher.country && <span className="mt-0.5 block text-xs font-bold text-stone-500">{teacher.country}</span>}
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-[#2f62b6] ring-1 ring-sky-200/80">
                {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
              </span>
            </TeacherQuickView>
          );
        })}
      </section>
    </div>
  );
}
