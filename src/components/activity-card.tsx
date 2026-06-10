import { AppLink as Link } from "@/components/app-link";
import { Heart, MapPin } from "lucide-react";
import type { Activity } from "@/lib/types";
import { timeRange } from "@/lib/utils";

const ROUTINE_CATEGORIES = new Set(["Meal", "Logistics"]);
const ROUTINE_TITLE = /^rise up/i;

function isRoutine(activity: Activity) {
  return (activity.category !== undefined && activity.category !== null && ROUTINE_CATEGORIES.has(activity.category)) ||
    ROUTINE_TITLE.test(activity.title);
}

type Props = {
  activity: Activity;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export function ActivityCard({ activity, isFavorite, onToggleFavorite }: Props) {
  if (isRoutine(activity)) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
        <span className="h-2 w-2 shrink-0 rounded-full bg-stone-300" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-stone-400">{timeRange(activity.startTime, activity.endTime)}</p>
          <p className="text-sm font-bold leading-snug text-stone-500">{activity.title}</p>
        </div>
        {activity.location && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-stone-400">
            <MapPin className="h-3 w-3" />{activity.location}
          </span>
        )}
      </div>
    );
  }

  return (
    <article className="activity-list-card relative overflow-hidden rounded-2xl p-4">
      {/* Row 1: time + heart */}
      <div className="flex items-start justify-between gap-3">
        <Link href={`/program/${activity.id}`} className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-[#f39200]">{timeRange(activity.startTime, activity.endTime)}</p>
          <h3 className="mt-2 line-clamp-2 text-[18px] font-black leading-snug text-slate-900">{activity.title}</h3>
        </Link>
        <div className="relative z-10 shrink-0">
          <button
            type="button"
            aria-label="Toggle favorite"
            onClick={() => onToggleFavorite?.(activity.id)}
            className={`activity-action-button ${isFavorite ? "bg-rose-500 text-white ring-rose-400/40" : "bg-white text-slate-600 ring-sky-900/10"}`}
          >
            <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <Link href={`/program/${activity.id}`} className="mt-3 block">
        {/* Tags row */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {activity.category && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200/80">{activity.category}</span>}
          {activity.location && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 inline h-3.5 w-3.5" />{activity.location}</span>}
          {activity.language && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 ring-1 ring-sky-200/80">{activity.language}</span>}
        </div>

        {/* Photo + facilitator + description */}
        {(activity.facilitator || activity.description) && (
          <div className="mt-3 flex items-start gap-3">
            {activity.photos && activity.photos.length > 0 ? (
              <div className="flex shrink-0 gap-1.5">
                {activity.photos.map((src, i) => (
                  <img key={i} src={src} alt={activity.facilitator ?? activity.title} className="w-12 rounded-lg object-contain shadow-sm ring-1 ring-sky-900/10" />
                ))}
              </div>
            ) : activity.photo ? (
              <img src={activity.photo} alt={activity.facilitator ?? activity.title} className="w-16 shrink-0 rounded-xl object-contain shadow-sm ring-1 ring-sky-900/10" />
            ) : null}
            <div className="min-w-0">
              {activity.facilitator && <p className="text-sm font-semibold text-slate-700">With {activity.facilitator}{activity.country ? ` · ${activity.country}` : ""}</p>}
              {activity.description && <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{activity.description}</p>}
            </div>
          </div>
        )}
      </Link>
    </article>
  );
}
