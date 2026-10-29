import type { Activity, Teacher } from "@/lib/types";

/**
 * Photos to show next to an activity: its own (`photos`, then `photo`), else
 * the resolved teacher's. Synced programs carry photos on the teacher only, so
 * without the fallback a session with a known teacher showed no image.
 */
export function activityPhotoSources(activity: Activity, teacher?: Teacher | null): string[] {
  if (activity.photos && activity.photos.length > 0) return activity.photos;
  if (activity.photo) return [activity.photo];
  if (teacher?.photos && teacher.photos.length > 0) return teacher.photos;
  if (teacher?.photo) return [teacher.photo];
  return [];
}

type Props = {
  sources: string[];
  alt: string;
  /** Classes for the image when there is exactly one. */
  single: string;
  /** Classes for each image when there are several (a teaching duo). */
  multi: string;
};

export function ActivityPhotos({ sources, alt, single, multi }: Props) {
  if (sources.length === 0) return null;
  if (sources.length === 1) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={sources[0]} alt={alt} className={single} />;
  }
  return (
    <span className="flex shrink-0 gap-1.5">
      {sources.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={alt} className={multi} />
      ))}
    </span>
  );
}
