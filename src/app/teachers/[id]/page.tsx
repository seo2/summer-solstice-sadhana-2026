import { AppLink as Link } from "@/components/app-link";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getTeacherById, sessionsForTeacher, teachers } from "@/lib/teachers";
import { timeRange } from "@/lib/utils";
import type { Activity } from "@/lib/types";

function formatDayLong(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function groupByDay(sessions: Activity[]) {
  const groups: { date: string; items: Activity[] }[] = [];
  for (const session of sessions) {
    const last = groups[groups.length - 1];
    if (last && last.date === session.date) last.items.push(session);
    else groups.push({ date: session.date, items: [session] });
  }
  return groups;
}

export function generateStaticParams() {
  return teachers.map((teacher) => ({ id: teacher.id }));
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacher = getTeacherById(id);
  if (!teacher) notFound();

  const groups = groupByDay(sessionsForTeacher(teacher));

  return (
    <article className="space-y-4 pt-1">
      <Link href="/teachers" className="inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]"><ArrowLeft className="h-4 w-4" /> Teachers</Link>

      <div className="flex items-center gap-4">
        <TeacherAvatar teacher={teacher} size="xl" />
        <div className="min-w-0">
          <h1 className="text-3xl font-black leading-none tracking-[-0.04em] text-slate-950">{teacher.name}</h1>
          {teacher.country && <p className="mt-2 text-sm font-bold text-stone-500">{teacher.country}</p>}
        </div>
      </div>

      {teacher.bio && (
        <section>
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">About</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{teacher.bio}</p>
        </section>
      )}

      <section>
        <p className="text-xs font-black uppercase tracking-widest text-stone-400">Sessions at Solstice</p>
        {groups.map((group) => (
          <div key={group.date}>
            <div className="mt-3 flex items-center gap-3 px-0.5 pb-1 pt-2">
              <span className="text-sm font-black text-[#2f62b6]">{formatDayLong(group.date)}</span>
              <div className="h-px flex-1 bg-sky-900/10" />
            </div>
            <div className="space-y-2.5">
              {group.items.map((session) => (
                <Link
                  key={session.id}
                  href={`/program/${session.id}`}
                  className="activity-list-card block rounded-xl p-4 transition-transform duration-150 active:scale-[0.99]"
                >
                  <p className="text-sm font-bold leading-tight text-[#f39200]">{timeRange(session.startTime, session.endTime)}</p>
                  <h3 className="mt-1 text-base font-black leading-snug text-slate-900">{session.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                    {session.category && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200/80">{session.category}</span>}
                    {session.location && <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 h-3.5 w-3.5" />{session.location}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
