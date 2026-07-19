import type { Teacher } from "@/lib/types";
import { avatarGradient, initialsOf } from "@/lib/teachers";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-12 w-12 text-sm",
  md: "h-[4.75rem] w-[4.75rem] text-xl",
  lg: "h-20 w-20 text-2xl",
  xl: "h-24 w-24 text-3xl",
};

function SingleAvatar({ src, name, gradient, size }: { src?: string; name: string; gradient: string; size: Size }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_6px_18px_rgba(47,98,182,0.18),inset_0_0_0_2px_rgba(255,255,255,0.65)] ${SIZE_CLASSES[size]}`}
      style={{ background: gradient }}
    >
      <span className="absolute inset-0 z-[1] flex items-center justify-center font-black tracking-tight text-white">
        {initialsOf(name)}
      </span>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="relative z-[2] h-full w-full object-cover" />
      )}
    </span>
  );
}

export function TeacherAvatar({ teacher, size = "md" }: { teacher: Teacher; size?: Size }) {
  if (teacher.photos && teacher.photos.length > 1) {
    const names = teacher.name.split(/\s*&\s*|\s+and\s+/);
    return (
      <span className="inline-flex shrink-0">
        <SingleAvatar src={teacher.photos[0]} name={names[0] ?? teacher.name} gradient={avatarGradient(teacher.id)} size={size} />
        <span className="-ml-4 inline-flex">
          <SingleAvatar src={teacher.photos[1]} name={names[1] ?? teacher.name} gradient={avatarGradient(`${teacher.id}-2`)} size={size} />
        </span>
      </span>
    );
  }
  return <SingleAvatar src={teacher.photo ?? teacher.photos?.[0]} name={teacher.name} gradient={avatarGradient(teacher.id)} size={size} />;
}
