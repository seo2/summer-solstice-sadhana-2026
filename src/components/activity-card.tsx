import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import type { Activity } from "@/lib/types";
import { formatDate, timeRange } from "@/lib/utils";

type Props = {
  activity: Activity;
  isFavorite?: boolean;
  isAgenda?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleAgenda?: (id: string) => void;
};

export function ActivityCard({ activity, isFavorite, isAgenda, onToggleFavorite, onToggleAgenda }: Props) {
  return (
    <article className="card rounded-3xl p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/program/${activity.id}`} className="min-w-0 flex-1">
          <p className="text-sm font-bold text-orange-800">{formatDate(activity.date)} · {timeRange(activity.startTime, activity.endTime)}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug text-stone-950">{activity.title}</h3>
        </Link>
        <div className="flex shrink-0 gap-2">
          <button aria-label="Toggle favorite" onClick={() => onToggleFavorite?.(activity.id)} className={`rounded-full p-2 ${isFavorite ? "bg-rose-500 text-white" : "bg-white text-stone-700"}`}>
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button aria-label="Toggle agenda" onClick={() => onToggleAgenda?.(activity.id)} className={`rounded-full p-2 ${isAgenda ? "bg-amber-500 text-white" : "bg-white text-stone-700"}`}>
            <Star className="h-5 w-5" fill={isAgenda ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        {activity.category && <span className="badge rounded-full px-3 py-1">{activity.category}</span>}
        {activity.location && <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800"><MapPin className="mr-1 inline h-3 w-3" />{activity.location}</span>}
        {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">{activity.language}</span>}
      </div>
      {activity.facilitator && <p className="mt-3 text-sm font-medium text-stone-700">With {activity.facilitator}{activity.country ? ` · ${activity.country}` : ""}</p>}
      {activity.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{activity.description}</p>}
    </article>
  );
}
