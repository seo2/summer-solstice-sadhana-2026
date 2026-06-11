"use client";

import { db, type ContactMessage } from "@/lib/db";

export const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim() ?? "";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "";

export const CONTACT_CATEGORIES = [
  "General support",
  "Registration",
  "First Aid / Wellness",
  "Lost & Found",
  "Facilities",
  "Schedule",
  "Woman's Renewal",
  "Feedback",
] as const;

export type ContactDraft = {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
};

type FlushResult = {
  sent: number;
  failed: number;
  skipped: "offline" | "missing-endpoint" | null;
};

function messageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

function endpointReady() {
  return CONTACT_ENDPOINT.length > 0;
}

function createContactMessage(draft: ContactDraft): ContactMessage {
  const createdAt = now();
  return {
    id: messageId(),
    name: normalize(draft.name),
    email: normalize(draft.email),
    phone: normalize(draft.phone),
    category: draft.category,
    message: draft.message.trim(),
    status: "queued",
    attempts: 0,
    createdAt,
    updatedAt: createdAt,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Message could not be sent.";
}

function contactPayload(record: ContactMessage) {
  return {
    source: "summer-solstice-sadhana-2026-pwa",
    event: "Summer Solstice Sadhana 2026",
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    category: record.category,
    message: record.message,
    createdAt: record.createdAt,
    attempts: record.attempts + 1,
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
    pageUrl: typeof window === "undefined" ? "" : window.location.href,
  };
}

async function sendContactMessage(record: ContactMessage) {
  if (!endpointReady()) throw new Error("Contact endpoint is not configured.");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactPayload(record)),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Contact endpoint returned ${response.status}.`);
  } finally {
    window.clearTimeout(timeout);
  }
}

export function canSendContactMessages() {
  return endpointReady() && isOnline();
}

export async function queueContactMessage(draft: ContactDraft) {
  const record = createContactMessage(draft);
  await db.contactMessages.put(record);
  if (canSendContactMessages()) await flushContactOutbox();
  return record.id;
}

export async function flushContactOutbox(): Promise<FlushResult> {
  if (!isOnline()) return { sent: 0, failed: 0, skipped: "offline" };
  if (!endpointReady()) return { sent: 0, failed: 0, skipped: "missing-endpoint" };

  const pending = await db.contactMessages.where("status").anyOf(["queued", "failed"]).sortBy("createdAt");
  let sent = 0;
  let failed = 0;

  for (const record of pending) {
    const attemptAt = now();
    await db.contactMessages.update(record.id, {
      status: "sending",
      attempts: record.attempts + 1,
      lastAttemptAt: attemptAt,
      updatedAt: attemptAt,
      error: undefined,
    });

    try {
      await sendContactMessage(record);
      const sentAt = now();
      await db.contactMessages.update(record.id, {
        status: "sent",
        sentAt,
        updatedAt: sentAt,
        error: undefined,
      });
      sent += 1;
    } catch (error) {
      const failedAt = now();
      await db.contactMessages.update(record.id, {
        status: "failed",
        updatedAt: failedAt,
        error: errorMessage(error),
      });
      failed += 1;
    }
  }

  return { sent, failed, skipped: null };
}

export function buildContactMailto(record: ContactMessage) {
  if (!CONTACT_EMAIL) return null;
  const subject = encodeURIComponent(`[Summer Solstice] ${record.category}`);
  const body = encodeURIComponent(
    [
      `Name: ${record.name}`,
      `Email: ${record.email || "-"}`,
      `Phone: ${record.phone || "-"}`,
      `Category: ${record.category}`,
      "",
      record.message,
      "",
      `Saved in app: ${record.createdAt}`,
      `Message ID: ${record.id}`,
    ].join("\n"),
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
