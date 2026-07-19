"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppLink as Link } from "@/components/app-link";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { ArrowRight, MapPin, X } from "lucide-react";
import type { Teacher } from "@/lib/types";
import type { TeacherSession } from "@/lib/teachers";
import { timeRange } from "@/lib/utils";

const PREVIEW_COUNT = 3;

type Props = {
  teacher: Teacher;
  sessions: TeacherSession[];
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

export function TeacherQuickView({ teacher, sessions, className, ariaLabel, children }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const categories = Array.from(new Set(sessions.map((session) => session.category).filter(Boolean))) as string[];
  const preview = sessions.slice(0, PREVIEW_COUNT);
  const extraCount = sessions.length - preview.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? `About ${teacher.name}`}
        className={className}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/35 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={teacher.name}
            className="activity-detail-card relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl p-6 pb-7 sm:rounded-2xl"
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

            <div className="flex items-center gap-4">
              <TeacherAvatar teacher={teacher} size="md" />
              <div className="min-w-0">
                <p className="text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950">{teacher.name}</p>
                {teacher.country && <p className="mt-1 text-sm font-bold text-stone-500">{teacher.country}</p>}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                {categories.map((category) => (
                  <span key={category} className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200/80">{category}</span>
                ))}
              </div>
            )}

            <p className="mb-2 mt-5 text-xs font-black uppercase tracking-[0.14em] text-stone-400">Sessions</p>
            <div className="space-y-2.5">
              {preview.map((session) => (
                <div key={`${session.id}-${session.date}-${session.startTime}`} className="rounded-xl border border-[rgba(47,98,182,0.10)] bg-white/90 p-3.5 shadow-[0_18px_48px_rgba(47,98,182,0.08)]">
                  <p className="text-sm font-bold leading-tight text-[#f39200]">{timeRange(session.startTime, session.endTime)}</p>
                  <h4 className="mt-1 text-base font-black leading-snug text-slate-900">{session.title}</h4>
                  {session.location && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#2f62b6]">
                      <MapPin className="h-3.5 w-3.5" />{session.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {extraCount > 0 && (
              <p className="mt-2 text-center text-xs font-semibold text-stone-400">+ {extraCount} more in the full profile</p>
            )}

            <Link
              href={`/teachers/${teacher.id}`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(47,98,182,0.24)]"
              onClick={close}
            >
              Show full profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
