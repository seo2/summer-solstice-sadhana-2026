// Prepared for the future Capacitor native phase. Not used by the PWA yet.
export async function requestLocalNotificationPermission() {
  if (typeof window === "undefined") return false;
  const capacitor = await import("@capacitor/core");
  if (!capacitor.Capacitor.isNativePlatform()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const result = await LocalNotifications.requestPermissions();
  return result.display === "granted";
}

export async function scheduleActivityReminder(activityId: string, title: string, at: Date) {
  const capacitor = await import("@capacitor/core");
  if (!capacitor.Capacitor.isNativePlatform()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.abs(hashCode(activityId)) % 2147483647,
        title: "Solstice activity soon",
        body: title,
        schedule: { at },
      },
    ],
  });
}

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
