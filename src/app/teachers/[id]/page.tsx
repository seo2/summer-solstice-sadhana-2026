import { AppLink as Link } from "@/components/app-link";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { TeacherSessions } from "@/components/teacher-sessions";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTeacherById, sessionsForTeacher, teachers } from "@/lib/teachers";
import type { Activity } from "@/lib/types";

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
        <TeacherSessions groups={groups} />
      </section>
    </article>
  );
}
