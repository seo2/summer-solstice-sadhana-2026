import { AppLink as Link } from "@/components/app-link";
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
    <article className="activity-list-card relative overflow-hidden rounded-[1.75rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/program/${activity.id}`} className="min-w-0 flex-1 pr-1">
          <p className="text-sm font-bold leading-tight text-[#f39200]">{formatDate(activity.date)} · {timeRange(activity.startTime, activity.endTime)}</p>
          <h3 className="mt-2 line-clamp-2 text-[18px] font-black leading-snug text-slate-900">{activity.title}</h3>
        </Link>
        <div className="relative z-10 flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Toggle favorite"
            onClick={() => onToggleFavorite?.(activity.id)}
            className={`activity-action-button ${isFavorite ? "bg-rose-500 text-white ring-rose-400/40" : "bg-white text-slate-600 ring-sky-900/10"}`}
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-label="Toggle agenda"
            onClick={() => onToggleAgenda?.(activity.id)}
            className={`activity-action-button ${isAgenda ? "bg-[#f39200] text-white ring-orange-300/60" : "bg-white text-slate-600 ring-sky-900/10"}`}
          >
            <Star className="h-5 w-5" fill={isAgenda ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <Link href={`/program/${activity.id}`} className="mt-3 block">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {activity.category && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200/80">{activity.category}</span>}
          {activity.location && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 inline h-3.5 w-3.5" />{activity.location}</span>}
          {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 ring-1 ring-sky-200/80">{activity.language}</span>}
        </div>
        {activity.facilitator && <p className="mt-3 text-sm font-semibold text-slate-700">With {activity.facilitator}{activity.country ? ` · ${activity.country}` : ""}</p>}
        {activity.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{activity.description}</p>}
      </Link>
    </article>
  );
}
