"use client";

/**
 * Program/Favorites view that renders either the built-in event (bundled JSON,
 * passed as props from the static page) or the active synced event from the
 * local event store. Synced activities open a detail sheet (they have no
 * statically exported pages) and resolve teachers against their own bundle.
 */

import { useMemo, useState } from "react";
import { ProgramExplorer } from "@/components/program-explorer";
import { ActivityDetailSheet } from "@/components/activity-detail-sheet";
import type { TeacherResolution } from "@/components/activity-card";
import {
  bundleActivities,
  bundleCategories,
  bundleTeachers,
  bundleVenues,
  useActiveSyncedEvent,
} from "@/lib/event-store";
import type { Activity, Category, Teacher, Venue } from "@/lib/types";
import type { TeacherSession } from "@/lib/teachers";

type Props = {
  activities: Activity[];
  venues: Venue[];
  categories: Category[];
  mode?: "all" | "favorites";
};

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

export function ProgramView({ activities, venues, categories, mode = "all" }: Props) {
  const synced = useActiveSyncedEvent();
  const [detail, setDetail] = useState<Activity | null>(null);

  const syncedData = useMemo(() => {
    if (!synced) return null;
    const syncedActivities = bundleActivities(synced.bundle);
    const teachers = bundleTeachers(synced.bundle);
    const byFacilitator = new Map<string, Teacher>();
    for (const teacher of teachers) {
      for (const name of teacher.facilitatorNames) byFacilitator.set(name, teacher);
    }
    return {
      activities: syncedActivities,
      // Landmarks are map-only points; they never host sessions.
      venues: bundleVenues(synced.bundle).filter((venue) => venue.kind !== "landmark"),
      categories: bundleCategories(synced.bundle),
      resolveTeacher: (activity: Activity): TeacherResolution => {
        if (!activity.facilitator) return null;
        const teacher = byFacilitator.get(activity.facilitator);
        return teacher ? { teacher, sessions: sessionsFor(teacher, syncedActivities) } : null;
      },
    };
  }, [synced]);

  if (!syncedData) {
    return <ProgramExplorer activities={activities} venues={venues} categories={categories} mode={mode} />;
  }

  const detailTeacher = detail ? syncedData.resolveTeacher(detail) : null;

  return (
    <>
      <ProgramExplorer
        activities={syncedData.activities}
        venues={syncedData.venues}
        categories={syncedData.categories}
        mode={mode}
        onOpenDetail={setDetail}
        resolveTeacher={syncedData.resolveTeacher}
        teacherProfileLinks={false}
      />
      {detail && (
        <ActivityDetailSheet
          activity={detail}
          teacher={detailTeacher?.teacher ?? null}
          teacherSessions={detailTeacher?.sessions ?? []}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
