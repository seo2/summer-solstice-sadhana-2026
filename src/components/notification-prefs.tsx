"use client";

/**
 * Notification preferences (N1/N3): two local toggles stored on the device and
 * sent with the push-device registration. Turning a toggle ON on the native
 * app is the in-context moment to request the OS notification permission.
 * On the web the preferences still persist — they apply to the mobile apps,
 * which is what the fine print says.
 */

import { useEffect, useState } from "react";
import { enablePush, getNotificationPrefs, refreshPushRegistration, setNotificationPrefs, type NotificationPrefs } from "@/lib/push";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-950">{label}</p>
        <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#2f62b6]" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

export function NotificationPrefsCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({ news: false, alerts: true });

  // Load the stored values after mount (avoids SSG hydration mismatches).
  useEffect(() => {
    setPrefs(getNotificationPrefs());
  }, []);

  function update(key: keyof NotificationPrefs, value: boolean) {
    const next = setNotificationPrefs({ [key]: value });
    setPrefs(next);
    if (value) {
      // Turning something ON is the in-context moment to ask for permission
      // (native only; both calls no-op in the browser).
      enablePush().catch(() => {});
    } else {
      refreshPushRegistration().catch(() => {});
    }
  }

  return (
    <section className="rounded-2xl border border-sky-900/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">Notifications</p>
      <div className="mt-1 divide-y divide-sky-900/10">
        <ToggleRow
          label="Event alerts"
          description="Urgent notices from the event team while an event is on."
          checked={prefs.alerts}
          onChange={(next) => update("alerts", next)}
        />
        <ToggleRow
          label="News about future events"
          description="Occasional announcements, like registration opening for the next Solstice."
          checked={prefs.news}
          onChange={(next) => update("news", next)}
        />
      </div>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
        Push notifications are delivered through the iOS/Android app.
      </p>
    </section>
  );
}
