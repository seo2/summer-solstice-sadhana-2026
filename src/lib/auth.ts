"use client";

/**
 * Accounts against the WordPress backend (auth/* routes of the
 * 3ho-solstice-app plugin). The bearer token and profile persist in Dexie so
 * the session survives restarts and works offline (reads only — auth actions
 * need connectivity).
 */

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { apiUrl } from "@/lib/backend";

export type UserProfile = {
  id: number;
  email: string;
  displayName: string;
  photoUrl?: string;
  homeTimezone?: string;
};

export type AuthSession = {
  key: string; // always "session"
  token: string;
  expiresAt: string;
  user: UserProfile;
  /** Set after the first successful favorites merge for this login. */
  mergedFavoritesAt?: string;
  lastSyncAt?: string;
};

class AuthDatabase extends Dexie {
  session!: Table<AuthSession, string>;

  constructor() {
    super("solstice-auth");
    this.version(1).stores({
      session: "key",
    });
  }
}

export const authDb = new AuthDatabase();

const SESSION_KEY = "session";

export function useAuth(): AuthSession | null | undefined {
  return useLiveQuery(async () => {
    const session = await authDb.session.get(SESSION_KEY);
    if (!session) return null;
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      await authDb.session.delete(SESSION_KEY);
      return null;
    }
    return session;
  }, []);
}

export async function getSession(): Promise<AuthSession | null> {
  const session = await authDb.session.get(SESSION_KEY);
  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    await authDb.session.delete(SESSION_KEY);
    return null;
  }
  return session;
}

export async function updateSession(patch: Partial<AuthSession>): Promise<void> {
  const session = await authDb.session.get(SESSION_KEY);
  if (!session) return;
  await authDb.session.put({ ...session, ...patch, key: SESSION_KEY });
}

type AuthResponse = {
  ok: boolean;
  error?: string;
  message?: string;
  user?: UserProfile;
  auth?: { token: string; expiresAt: string };
};

async function postJson(path: string, body: unknown, token?: string): Promise<AuthResponse> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as AuthResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.message || `Request failed (HTTP ${response.status}).`);
  }

  return data;
}

async function storeSession(data: AuthResponse): Promise<AuthSession> {
  if (!data.user || !data.auth) {
    throw new Error("Malformed auth response.");
  }

  const session: AuthSession = {
    key: SESSION_KEY,
    token: data.auth.token,
    expiresAt: data.auth.expiresAt,
    user: data.user,
  };

  await authDb.session.put(session);
  return session;
}

export async function register(email: string, password: string, displayName: string): Promise<AuthSession> {
  const data = await postJson("auth/register", { email, password, displayName });
  return storeSession(data);
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const data = await postJson("auth/login", { email, password });
  return storeSession(data);
}

export async function logout(): Promise<void> {
  const session = await getSession();

  // Best-effort: stop push delivery to this device for the account.
  try {
    const { disablePush } = await import("@/lib/push");
    await disablePush();
  } catch {
    // Native push not available — nothing to unregister.
  }

  if (session) {
    try {
      await postJson("auth/logout", {}, session.token);
    } catch {
      // Token revocation failed (offline?) — still clear locally; the token
      // expires server-side after 30 days regardless.
    }
  }

  await authDb.session.delete(SESSION_KEY);
}
