import { AppLink as Link } from "@/components/app-link";
import { ActivityActions } from "@/components/activity-actions";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import program from "@/data/program.json";
import type { Activity } from "@/lib/types";
import { timeRange } from "@/lib/utils";

const activities = program as Activity[];

function formatDetailDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function generateStaticParams() {
  return activities.map((activity) => ({ id: activity.id }));
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = activities.find((item) => item.id === id);
  if (!activity) notFound();

  return (
    <article className="space-y-4 pt-1">
      <Link href="/program" className="inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]"><ArrowLeft className="h-4 w-4" /> Program</Link>
      <div className="activity-detail-card rounded-2xl p-5 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#2f62b6]">{formatDetailDate(activity.date)}</p>
        <h1 className="mt-3 text-3xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-4xl">{activity.title}</h1>
        <p className="mt-5 text-xl font-black text-[#f39200]">{timeRange(activity.startTime, activity.endTime)}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          {activity.category && <span className="badge rounded-full px-3 py-1.5">{activity.category}</span>}
          {activity.location && <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 h-4 w-4" />{activity.location}</span>}
          {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 ring-1 ring-sky-200/80">{activity.language}</span>}
        </div>
        {(activity.facilitator || activity.description) && (
          <div className="mt-7 flex items-start gap-4">
            {activity.photos && activity.photos.length > 0 ? (
              <div className="flex shrink-0 gap-1.5">
                {activity.photos.map((src, i) => (
                  <img key={i} src={src} alt={activity.facilitator ?? activity.title} className="w-14 rounded-xl object-contain shadow-md ring-1 ring-sky-900/10" />
                ))}
              </div>
            ) : activity.photo ? (
              <img src={activity.photo} alt={activity.facilitator ?? activity.title} className="w-16 shrink-0 rounded-xl object-contain shadow-md ring-1 ring-sky-900/10" />
            ) : null}
            <div className="min-w-0 flex-1">
              {activity.facilitator && (
                <div className="mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-stone-400">Facilitator</p>
                  <p className="mt-0.5 text-base font-bold text-stone-800">{activity.facilitator}{activity.country ? ` · ${activity.country}` : ""}</p>
                </div>
              )}
              {activity.description && <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">{activity.description}</p>}
            </div>
          </div>
        )}
        <ActivityActions activityId={activity.id} />
      </div>
    </article>
  );
}
