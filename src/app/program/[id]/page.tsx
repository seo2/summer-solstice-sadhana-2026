import { AppLink as Link } from "@/components/app-link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import program from "@/data/program.json";
import type { Activity } from "@/lib/types";
import { formatDate, timeRange } from "@/lib/utils";

const activities = program as Activity[];

export function generateStaticParams() {
  return activities.map((activity) => ({ id: activity.id }));
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = activities.find((item) => item.id === id);
  if (!activity) notFound();

  return (
    <article className="space-y-4">
      <Link href="/program" className="inline-flex items-center gap-2 text-sm font-bold text-[#2f62b6]"><ArrowLeft className="h-4 w-4" /> Program</Link>
      <div className="card rounded-[2rem] p-5">
        <p className="solstice-kicker text-sm font-bold uppercase">{formatDate(activity.date)}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">{activity.title}</h1>
        <p className="mt-3 text-xl font-bold text-[#2f62b6]">{timeRange(activity.startTime, activity.endTime)}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          {activity.category && <span className="badge rounded-full px-3 py-1">{activity.category}</span>}
          {activity.location && <span className="rounded-full bg-sky-50 px-3 py-1 text-[#2f62b6]"><MapPin className="mr-1 inline h-4 w-4" />{activity.location}</span>}
          {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">{activity.language}</span>}
        </div>
        {activity.facilitator && <p className="mt-5 text-base font-bold text-stone-800">Facilitator: {activity.facilitator}{activity.country ? ` · ${activity.country}` : ""}</p>}
        {activity.description && <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-stone-700">{activity.description}</p>}
        {activity.sourcePage && <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Source PDF page {activity.sourcePage}</p>}
      </div>
      <p className="rounded-3xl bg-sky-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-sky-900/10">Use the heart and star buttons from the Program list to save this activity locally on your phone.</p>
    </article>
  );
}
