"use client";

/**
 * Account: login/register against the WordPress backend, profile + favorites
 * sync when logged in. The app never requires an account — this only adds
 * cross-device sync (and, later, push and messaging identity).
 */

import { useState } from "react";
import { AppLink as Link } from "@/components/app-link";
import { ArrowLeft, CloudUpload, FlaskConical, LogOut, RefreshCw, UserRound } from "lucide-react";
import { login, logout, register, useAuth } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/backend";
import { syncFavorites } from "@/lib/favorites-sync";
import { useSavedActivities } from "@/lib/db";

/**
 * Sync Lab is an internal bench, unlinked from the app on purpose. The native
 * shell has no address bar, so without an entry point there is no way to point
 * a test build at a local backend or pull an event into it. Build test apps
 * with NEXT_PUBLIC_SHOW_SYNC_LAB=1 (npm run cap:sync:dev) to reveal it; store
 * builds leave it unset and the block never renders.
 */
const SHOW_SYNC_LAB = process.env.NEXT_PUBLIC_SHOW_SYNC_LAB === "1";

type Mode = "login" | "register";

function formatWhen(iso?: string) {
  if (!iso) return "never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export default function AccountPage() {
  const auth = useAuth();
  const { favoriteIds } = useSavedActivities();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (mode === "register") {
        await register(email.trim(), password, displayName.trim());
      } else {
        await login(email.trim(), password);
      }
      setPassword("");
      setNotice("Signed in. Your favorites will sync to your account.");
      syncFavorites().catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Check your connection and try again.");
    }

    setBusy(false);
  }

  async function handleSyncNow() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const count = await syncFavorites();
      setNotice(count === null ? "Sign in first." : `Synced — ${count} favorite${count === 1 ? "" : "s"} on this device.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed. Check your connection and try again.");
    }
    setBusy(false);
  }

  async function handleLogout() {
    setBusy(true);
    await logout();
    setNotice("");
    setError("");
    setBusy(false);
  }

  return (
    <div className="space-y-5 pt-1">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]"><ArrowLeft className="h-4 w-4" /> Home</Link>

      <section>
        <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Your Account</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Account</h1>
        <p className="mt-1 text-sm font-semibold text-stone-600">
          Optional — the app works fully without an account. Signing in keeps your favorites safe across devices.
        </p>
      </section>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 ring-1 ring-rose-200/80">{error}</p>}
      {notice && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200/80">{notice}</p>}

      {auth ? (
        <section className="activity-detail-card space-y-5 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-white shadow-[0_6px_18px_rgba(47,98,182,0.3)]">
              <UserRound className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-black tracking-tight text-slate-950">{auth.user.displayName}</p>
              <p className="truncate text-sm font-semibold text-stone-500">{auth.user.email}</p>
            </div>
          </div>

          <div className="rounded-xl bg-sky-50/70 px-4 py-3 ring-1 ring-sky-200/60">
            <p className="text-xs font-black uppercase tracking-widest text-stone-400">Favorites sync</p>
            <p className="mt-1 text-sm font-semibold text-stone-700">
              {favoriteIds.size} favorite{favoriteIds.size === 1 ? "" : "s"} on this device · last synced: {formatWhen(auth.lastSyncAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleSyncNow}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] px-5 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(47,98,182,0.24)] disabled:opacity-50"
            >
              <CloudUpload className="h-4 w-4" />
              Sync now
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-sky-900/10 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </section>
      ) : (
        <section className="activity-detail-card rounded-2xl p-6">
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${mode === "login" ? "bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-white shadow-[0_8px_18px_rgba(47,98,182,0.24)]" : "bg-white text-[#2f62b6] ring-1 ring-sky-200/80"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${mode === "register" ? "bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-white shadow-[0_8px_18px_rgba(47,98,182,0.24)]" : "bg-white text-[#2f62b6] ring-1 ring-sky-200/80"}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <label className="block">
                <span className="text-xs font-black uppercase tracking-widest text-stone-400">Name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1 w-full rounded-xl bg-white px-3 py-3 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-sky-900/10 outline-none"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-stone-400">{mode === "register" ? "Email" : "Email or username"}</span>
              <input
                type={mode === "register" ? "email" : "text"}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete={mode === "register" ? "email" : "username"}
                className="mt-1 w-full rounded-xl bg-white px-3 py-3 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-sky-900/10 outline-none"
              />
              {mode === "login" && <span className="mt-1 block text-xs font-semibold text-stone-400">Your 3ho.org account works here too.</span>}
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-stone-400">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-xl bg-white px-3 py-3 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-sky-900/10 outline-none"
              />
              {mode === "register" && <span className="mt-1 block text-xs font-semibold text-stone-400">At least 8 characters.</span>}
            </label>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(47,98,182,0.24)] disabled:opacity-50"
            >
              {busy && <RefreshCw className="h-4 w-4 animate-spin" />}
              {mode === "register" ? "Create account" : "Sign in"}
            </button>
            {mode === "login" && (
              <p className="text-center">
                <a
                  href={`${getBackendBaseUrl()}/wp-login.php?action=lostpassword`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-[#2f62b6] underline decoration-sky-200/80 underline-offset-2"
                >
                  Forgot your password?
                </a>
              </p>
            )}
          </form>
        </section>
      )}

      {SHOW_SYNC_LAB && (
        <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Internal build</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-stone-500">
            Point the app at a backend and pull an event bundle. Not present in store builds.
          </p>
          <Link
            href="/sync-lab"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-black text-stone-600 ring-1 ring-stone-300"
          >
            <FlaskConical className="h-4 w-4" />
            Sync Lab
          </Link>
        </section>
      )}

      <p className="pt-2 text-center text-xs font-semibold text-stone-400">
        <Link href="/privacy" className="underline decoration-stone-300 underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
