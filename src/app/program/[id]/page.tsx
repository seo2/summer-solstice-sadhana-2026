import { AppLink as Link } from "@/components/app-link";
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
      <div className="activity-detail-card rounded-[2rem] p-5 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f39200]">{formatDetailDate(activity.date)}</p>
        <h1 className="mt-3 text-3xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-4xl">{activity.title}</h1>
        <p className="mt-5 text-xl font-black text-[#2f62b6]">{timeRange(activity.startTime, activity.endTime)}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          {activity.category && <span className="badge rounded-full px-3 py-1.5">{activity.category}</span>}
          {activity.location && <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 h-4 w-4" />{activity.location}</span>}
          {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 ring-1 ring-sky-200/80">{activity.language}</span>}
        </div>
        {activity.facilitator && <p className="mt-7 text-base font-bold text-stone-800">Facilitator: {activity.facilitator}{activity.country ? ` · ${activity.country}` : ""}</p>}
        {activity.description && <p className="mt-7 whitespace-pre-wrap text-base leading-8 text-stone-700">{activity.description}</p>}
        {activity.sourcePage && <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Source PDF page {activity.sourcePage}</p>}
      </div>
      <div className="rounded-[1.75rem] bg-sky-50/92 p-4 text-sm font-semibold leading-6 text-slate-700 ring-1 ring-[#2f62b6]/20">
        Use the heart and star buttons from the Program list to save this activity locally.
      </div>
    </article>
  );
}
