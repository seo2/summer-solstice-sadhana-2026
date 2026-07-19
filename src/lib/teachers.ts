import teachersData from "@/data/teachers.json";
import programData from "@/data/program.json";
import type { Activity, Teacher } from "@/lib/types";

export const teachers = teachersData as Teacher[];

const activities = programData as Activity[];

const byFacilitatorName = new Map<string, Teacher>();
for (const teacher of teachers) {
  for (const name of teacher.facilitatorNames) {
    byFacilitatorName.set(name, teacher);
  }
}

export function getTeacherById(id: string): Teacher | undefined {
  return teachers.find((teacher) => teacher.id === id);
}

export function teacherForActivity(activity: Activity): Teacher | undefined {
  if (!activity.facilitator) return undefined;
  return byFacilitatorName.get(activity.facilitator);
}

export function sessionsForTeacher(teacher: Teacher): Activity[] {
  const names = new Set(teacher.facilitatorNames);
  return activities
    .filter((activity) => activity.facilitator && names.has(activity.facilitator))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

/** Serializable session summary passed to client components (quick-view modal). */
export type TeacherSession = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  category?: string;
};

export function sessionSummariesForTeacher(teacher: Teacher): TeacherSession[] {
  return sessionsForTeacher(teacher).map((activity) => ({
    id: activity.id,
    title: activity.title,
    date: activity.date,
    startTime: activity.startTime,
    endTime: activity.endTime,
    location: activity.location,
    category: activity.category,
  }));
}

export function initialsOf(name: string): string {
  const parts = name.replace(/&/g, " ").split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#2f62b6,#39a9ef)",
  "linear-gradient(135deg,#f39200,#ffd66b)",
  "linear-gradient(135deg,#39a9ef,#7bd0a0)",
  "linear-gradient(135deg,#9a5a00,#f39200)",
  "linear-gradient(135deg,#2f62b6,#6f8fd6)",
];

export function avatarGradient(id: string): string {
  let sum = 0;
  for (const char of id) sum += char.charCodeAt(0);
  return AVATAR_GRADIENTS[Math.abs(sum) % AVATAR_GRADIENTS.length];
}
