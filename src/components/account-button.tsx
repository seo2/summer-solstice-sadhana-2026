"use client";

/**
 * Header account entry (top right, every screen): a neutral user icon when
 * logged out, the user's initials on the brand gradient when logged in.
 * Both states lead to /account. While sign-in is hidden
 * (ACCOUNT_SIGN_IN_ENABLED = false) the logged-out icon is not rendered at
 * all — only a device that still holds a session sees the button.
 */

import { AppLink as Link } from "@/components/app-link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ACCOUNT_SIGN_IN_ENABLED } from "@/lib/features";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function AccountButton() {
  const auth = useAuth();

  if (auth) {
    return (
      <Link
        href="/account"
        aria-label={`Account — ${auth.user.displayName}`}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-sm font-black text-white shadow-[0_6px_16px_rgba(47,98,182,0.28)] ring-2 ring-white/70 transition-transform duration-150 active:scale-95"
      >
        {initialsOf(auth.user.displayName) || <UserRound className="h-5 w-5" />}
      </Link>
    );
  }

  // Nothing to offer a logged-out user while sign-in is hidden.
  if (!ACCOUNT_SIGN_IN_ENABLED) return null;

  return (
    <Link
      href="/account"
      aria-label="Account — sign in"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-sky-900/15 transition-transform duration-150 active:scale-95"
    >
      <UserRound className="h-5 w-5" />
    </Link>
  );
}
