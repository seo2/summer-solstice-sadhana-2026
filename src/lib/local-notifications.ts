// Local notifications for agenda reminders — native (Capacitor) only; every
// function no-ops in the browser/PWA. Wired to favorites by ReminderAgent.

export type ReminderInput = {
  activityId: string;
  title: string;
  at: Date;
};

async function nativeLocalNotifications() {
  if (typeof window === "undefined") return null;
  const capacitor = await import("@capacitor/core");
  if (!capacitor.Capacitor.isNativePlatform()) return null;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

export async function requestLocalNotificationPermission(): Promise<boolean> {
  const notifications = await nativeLocalNotifications();
  if (!notifications) return false;
  const result = await notifications.requestPermissions();
  return result.display === "granted";
}

/**
 * Replace all scheduled favorite reminders with the given set (only future
 * times are scheduled). Called by ReminderAgent whenever favorites change.
 */
export async function rescheduleFavoriteReminders(reminders: ReminderInput[]): Promise<void> {
  const notifications = await nativeLocalNotifications();
  if (!notifications) return;

  const pending = await notifications.getPending();
  if (pending.notifications.length > 0) {
    await notifications.cancel({
      notifications: pending.notifications.map((notification) => ({ id: notification.id })),
    });
  }

  const now = Date.now();
  const upcoming = reminders.filter((reminder) => reminder.at.getTime() > now);
  if (upcoming.length === 0) return;

  await notifications.schedule({
    notifications: upcoming.map((reminder) => ({
      id: Math.abs(hashCode(reminder.activityId)) % 2147483647,
      title: "Starting soon",
      body: reminder.title,
      schedule: { at: reminder.at },
    })),
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
