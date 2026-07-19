"use client";

/**
 * Full activity detail rendered as a sheet/modal — used for synced events,
 * whose activities have no statically exported /program/[id] pages. Mirrors
 * the static detail page layout and includes the favorite toggle.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, MapPin, X } from "lucide-react";
import { TeacherQuickView } from "@/components/teacher-quick-view";
import { useSavedActivities } from "@/lib/db";
import type { Activity, Teacher } from "@/lib/types";
import type { TeacherSession } from "@/lib/teachers";
import { timeRange } from "@/lib/utils";

const CLOSE_MS = 170;

function formatDetailDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

type Props = {
  activity: Activity;
  teacher?: Teacher | null;
  teacherSessions?: TeacherSession[];
  onClose: () => void;
};

export function ActivityDetailSheet({ activity, teacher, teacherSessions = [], onClose }: Props) {
  const { favoriteIds, toggleFavorite } = useSavedActivities();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const close = useCallback(() => {
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, [close]);

  const isFavorite = favoriteIds.has(activity.id);

  return createPortal(
    <div
      className={`teacher-overlay ${closing ? "teacher-overlay-closing" : ""} fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/35 backdrop-blur-sm sm:items-center sm:p-6`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activity.title}
        className="teacher-modal-card activity-detail-card relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl p-6 pb-7 sm:rounded-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200 sm:hidden" />
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-sky-900/10"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="teacher-modal-item text-xs font-black uppercase tracking-[0.24em] text-[#2f62b6]" style={{ animationDelay: "40ms" }}>
          {formatDetailDate(activity.date)}
        </p>
        <h1 className="teacher-modal-item mt-2 text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950" style={{ animationDelay: "60ms" }}>
          {activity.title}
        </h1>
        <p className="teacher-modal-item mt-3 text-lg font-black text-[#f39200]" style={{ animationDelay: "80ms" }}>
          {timeRange(activity.startTime, activity.endTime)}
        </p>

        <div className="teacher-modal-item mt-4 flex flex-wrap gap-2 text-xs font-bold" style={{ animationDelay: "110ms" }}>
          {activity.category && <span className="badge rounded-full px-3 py-1.5">{activity.category}</span>}
          {activity.tags?.map((tag) => (
            <span key={tag} className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800 ring-1 ring-rose-200/80">{tag}</span>
          ))}
          {activity.location && <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 h-3.5 w-3.5" />{activity.location}</span>}
          {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 ring-1 ring-sky-200/80">{activity.language}</span>}
        </div>

        {(activity.facilitator || activity.description) && (
          <div className="teacher-modal-item mt-5 flex items-start gap-4" style={{ animationDelay: "140ms" }}>
            {(activity.photos && activity.photos.length > 0 ? (
              <span className="flex shrink-0 gap-1.5">
                {activity.photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={activity.facilitator ?? activity.title} className="w-14 rounded-xl object-cover shadow-md ring-1 ring-sky-900/10" />
                ))}
              </span>
            ) : activity.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activity.photo} alt={activity.facilitator ?? activity.title} className="w-16 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-sky-900/10" />
            ) : null)}
            <div className="min-w-0 flex-1">
              {activity.facilitator && (
                <div className="mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-stone-400">Facilitator</p>
                  <p className="mt-0.5 text-base font-bold text-stone-800">
                    {teacher ? (
                      <TeacherQuickView
                        teacher={teacher}
                        sessions={teacherSessions}
                        showProfileLink={false}
                        className="font-bold text-[#2f62b6] underline decoration-sky-200/80 underline-offset-2"
                      >
                        {activity.facilitator}
                      </TeacherQuickView>
                    ) : (
                      activity.facilitator
                    )}
                    {activity.country ? ` · ${activity.country}` : ""}
                  </p>
                </div>
              )}
              {activity.description && <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">{activity.description}</p>}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(activity.id)}
          className={`teacher-modal-item mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ${
            isFavorite ? "bg-rose-500 text-white ring-rose-400/40" : "bg-white text-slate-700 ring-sky-900/10"
          }`}
          style={{ animationDelay: "180ms" }}
        >
          <Heart className="h-[1.15rem] w-[1.15rem]" fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Saved" : "Favorite"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
