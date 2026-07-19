"use client";

/**
 * Teachers grid that renders the built-in event's teachers (static content)
 * or the active synced event's. Synced teachers have no static profile pages,
 * so their quick view shows all sessions plus the bio inline.
 */

import { useMemo } from "react";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { TeacherQuickView } from "@/components/teacher-quick-view";
import { sessionSummariesForTeacher, teachers as builtinTeachers, type TeacherSession } from "@/lib/teachers";
import { bundleActivities, bundleTeachers, useActiveSyncedEvent } from "@/lib/event-store";
import type { Activity, Teacher } from "@/lib/types";

function sessionsFor(teacher: Teacher, activities: Activity[]): TeacherSession[] {
  const names = new Set(teacher.facilitatorNames);
  return activities
    .filter((activity) => activity.facilitator && names.has(activity.facilitator))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
    .map((activity) => ({
      id: activity.id,
      title: activity.title,
      date: activity.date,
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location,
      category: activity.category,
    }));
}

export function TeachersView() {
  const synced = useActiveSyncedEvent();

  const data = useMemo(() => {
    if (synced) {
      const activities = bundleActivities(synced.bundle);
      return {
        teachers: bundleTeachers(synced.bundle),
        sessionsFor: (teacher: Teacher) => sessionsFor(teacher, activities),
        profileLinks: false,
      };
    }
    return {
      teachers: builtinTeachers,
      sessionsFor: (teacher: Teacher) => sessionSummariesForTeacher(teacher),
      profileLinks: true,
    };
  }, [synced]);

  return (
    <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
      {data.teachers.map((teacher) => {
        const sessions = data.sessionsFor(teacher);
        return (
          <TeacherQuickView
            key={teacher.id}
            teacher={teacher}
            sessions={sessions}
            showProfileLink={data.profileLinks}
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
  );
}
