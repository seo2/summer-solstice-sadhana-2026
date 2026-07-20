"use client";

/**
 * Native-only background agent: keeps local notifications in sync with the
 * favorites — a reminder fires 15 minutes before each favorited session
 * (built-in event, plus the active synced event). No-ops entirely in the
 * browser/PWA; works fully offline once content is on the device.
 */

import { useEffect, useRef } from "react";
import program from "@/data/program.json";
import { useSavedActivities } from "@/lib/db";
import { bundleActivities, useActiveSyncedEvent } from "@/lib/event-store";
import {
  requestLocalNotificationPermission,
  rescheduleFavoriteReminders,
  type ReminderInput,
} from "@/lib/local-notifications";
import type { Activity } from "@/lib/types";

const LEAD_MINUTES = 15;

const builtinById = new Map((program as Activity[]).map((activity) => [activity.id, activity]));

function reminderFor(activity: Activity): ReminderInput | null {
  const start = new Date(`${activity.date}T${activity.startTime}:00`);
  if (Number.isNaN(start.getTime())) return null;
  return {
    activityId: activity.id,
    title: activity.title,
    at: new Date(start.getTime() - LEAD_MINUTES * 60 * 1000),
  };
}

export function ReminderAgent() {
  const { favoriteIds } = useSavedActivities();
  const synced = useActiveSyncedEvent();
  const askedPermission = useRef(false);
  const signature = Array.from(favoriteIds).sort().join("|");

  useEffect(() => {
    const syncedById = synced
      ? new Map(bundleActivities(synced.bundle).map((activity) => [activity.id, activity]))
      : null;

    const reminders: ReminderInput[] = [];
    for (const id of favoriteIds) {
      const activity = builtinById.get(id) ?? syncedById?.get(id);
      if (!activity) continue;
      const reminder = reminderFor(activity);
      if (reminder) reminders.push(reminder);
    }

    (async () => {
      if (reminders.length > 0 && !askedPermission.current) {
        askedPermission.current = true;
        const granted = await requestLocalNotificationPermission();
        if (!granted) return;
      }
      await rescheduleFavoriteReminders(reminders);
    })().catch(() => {
      // Native APIs unavailable or permission denied — reminders are best-effort.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, synced?.slug]);

  return null;
}
