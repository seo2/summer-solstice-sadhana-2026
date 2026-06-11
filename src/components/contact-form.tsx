"use client";

import { AppLink as Link } from "@/components/app-link";
import { db, type ContactMessage, useContactMessages } from "@/lib/db";
import {
  buildContactMailto,
  canSendContactMessages,
  CONTACT_CATEGORIES,
  CONTACT_EMAIL,
  CONTACT_ENDPOINT,
  flushContactOutbox,
  queueContactMessage,
  type ContactDraft,
} from "@/lib/contact-outbox";
import {
  AlertTriangle,
  CheckCircle,
  Clock3,
  LifeBuoy,
  Mail,
  MapPin,
  RefreshCcw,
  Send,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

const blankForm: ContactDraft = {
  name: "",
  email: "",
  phone: "",
  category: CONTACT_CATEGORIES[0],
  message: "",
};

function messageDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusTone(status: ContactMessage["status"]) {
  if (status === "sent") return "bg-emerald-50 text-emerald-700 ring-emerald-900/10";
  if (status === "failed") return "bg-rose-50 text-rose-700 ring-rose-900/10";
  if (status === "sending") return "bg-sky-50 text-[#2f62b6] ring-sky-900/10";
  return "bg-amber-50 text-[#9a5a00] ring-amber-900/10";
}

function statusIcon(status: ContactMessage["status"]) {
  if (status === "sent") return CheckCircle;
  if (status === "failed") return AlertTriangle;
  if (status === "sending") return RefreshCcw;
  return Clock3;
}

function StatusBadge({ message }: { message: ContactMessage }) {
  const Icon = statusIcon(message.status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black capitalize ring-1 ${statusTone(message.status)}`}>
      <Icon className={`h-3.5 w-3.5 ${message.status === "sending" ? "animate-spin" : ""}`} />
      {message.status}
    </span>
  );
}

export function ContactForm() {
  const [form, setForm] = useState(blankForm);
  const [online, setOnline] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const messages = useContactMessages();

  useEffect(() => {
    const refreshOnline = () => setOnline(navigator.onLine);
    refreshOnline();
    window.addEventListener("online", refreshOnline);
    window.addEventListener("offline", refreshOnline);
    return () => {
      window.removeEventListener("online", refreshOnline);
      window.removeEventListener("offline", refreshOnline);
    };
  }, []);

  const counts = useMemo(() => {
    const pending = messages.filter((item) => item.status === "queued" || item.status === "failed");
    const sending = messages.filter((item) => item.status === "sending");
    const sent = messages.filter((item) => item.status === "sent");
    return { pending: pending.length, sending: sending.length, sent: sent.length };
  }, [messages]);

  const canSendNow = online !== false && canSendContactMessages();
  const submitLabel = canSendNow ? "Send message" : "Save message";
  const deliveryStatus = !CONTACT_ENDPOINT
    ? "Local queue"
    : online === false
      ? "Offline"
      : online === null
        ? "Checking"
        : "Online";

  async function syncOutbox() {
    setSyncing(true);
    setError("");
    const result = await flushContactOutbox();
    setSyncing(false);

    if (result.skipped === "missing-endpoint") {
      setNotice("Saved on this device.");
    } else if (result.skipped === "offline") {
      setNotice("Offline. Messages stay pending.");
    } else if (result.failed > 0) {
      setError("Some messages could not be sent yet.");
    } else if (result.sent > 0) {
      setNotice(`${result.sent} message${result.sent === 1 ? "" : "s"} sent.`);
    } else {
      setNotice("No pending messages.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      setError("Add an email or phone number.");
      return;
    }

    if (!form.message.trim()) {
      setError("Message is required.");
      return;
    }

    setSubmitting(true);
    const id = await queueContactMessage(form);
    const saved = await db.contactMessages.get(id);
    setSubmitting(false);

    setForm((current) => ({ ...blankForm, name: current.name, email: current.email, phone: current.phone }));
    setNotice(saved?.status === "sent" ? "Message sent." : "Message saved in the outbox.");
  }

  async function removeMessage(id: string) {
    await db.contactMessages.delete(id);
  }

  async function clearSent() {
    await db.contactMessages.where("status").equals("sent").delete();
  }

  return (
    <div className="space-y-4">
      <section className="card overflow-hidden rounded-2xl p-0">
        <div className="border-b border-sky-900/10 bg-linear-to-r from-sky-50 via-white to-orange-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">Support</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#2f62b6]">Contact</h1>
            </div>
            <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white px-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-sky-900/10">
              {online === false ? <WifiOff className="h-4 w-4 text-rose-600" /> : <Wifi className="h-4 w-4 text-emerald-600" />}
              {deliveryStatus}
            </span>
          </div>
        </div>

        <div className="grid gap-3 p-4">
          <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700 shadow-sm">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-rose-950">Urgent help</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-rose-800">
                  Go to First Aid or Registration in person. Digital messages are not monitored for emergencies.
                </p>
                <Link
                  href="/map"
                  className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-rose-700 ring-1 ring-rose-900/10"
                >
                  <MapPin className="h-4 w-4" />
                  Open map
                </Link>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-black text-slate-700">
                Name
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="min-h-12 rounded-xl border border-sky-900/10 bg-white px-3 text-sm font-bold text-slate-950 outline-none ring-[#2f62b6]/0 transition focus:border-[#2f62b6] focus:ring-4"
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-black text-slate-700">
                Need
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="min-h-12 rounded-xl border border-sky-900/10 bg-white px-3 text-sm font-bold text-slate-950 outline-none ring-[#2f62b6]/0 transition focus:border-[#2f62b6] focus:ring-4"
                >
                  {CONTACT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-black text-slate-700">
                Email
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="min-h-12 rounded-xl border border-sky-900/10 bg-white px-3 text-sm font-bold text-slate-950 outline-none ring-[#2f62b6]/0 transition focus:border-[#2f62b6] focus:ring-4"
                  inputMode="email"
                  autoComplete="email"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-black text-slate-700">
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="min-h-12 rounded-xl border border-sky-900/10 bg-white px-3 text-sm font-bold text-slate-950 outline-none ring-[#2f62b6]/0 transition focus:border-[#2f62b6] focus:ring-4"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-black text-slate-700">
              Message
              <textarea
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className="min-h-32 resize-none rounded-xl border border-sky-900/10 bg-white px-3 py-3 text-sm font-semibold leading-6 text-slate-950 outline-none ring-[#2f62b6]/0 transition focus:border-[#2f62b6] focus:ring-4"
              />
            </label>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-900/10">{error}</p>
            ) : null}
            {notice ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-900/10">{notice}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2f62b6] px-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(47,98,182,0.22)] transition active:scale-[0.99] disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Saving..." : submitLabel}
            </button>
          </form>
        </div>
      </section>

      <section className="card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">Outbox</p>
            <h2 className="mt-0.5 text-xl font-black text-slate-950">{counts.pending + counts.sending} pending</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{counts.sent} sent from this device</p>
          </div>
          <button
            type="button"
            onClick={syncOutbox}
            disabled={syncing}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-[#2f62b6] shadow-sm ring-1 ring-sky-900/10 disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Retry
          </button>
        </div>

        {messages.length ? (
          <div className="mt-4 grid gap-2">
            {messages.slice(0, 5).map((message) => {
              const mailto = buildContactMailto(message);
              return (
                <article key={message.id} className="rounded-xl bg-white/86 p-3 ring-1 ring-sky-900/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{message.category}</p>
                      <p className="text-xs font-semibold text-slate-500">{messageDate(message.createdAt)}</p>
                    </div>
                    <StatusBadge message={message} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-600">{message.message}</p>
                  {message.error ? <p className="mt-2 text-xs font-bold text-rose-600">{message.error}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mailto ? (
                      <a
                        href={mailto}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-50 px-3 text-xs font-black text-[#2f62b6] ring-1 ring-sky-900/10"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email draft
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeMessage(message.id)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-slate-500 ring-1 ring-sky-900/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-white/86 px-3 py-4 text-sm font-semibold text-slate-500 ring-1 ring-sky-900/10">
            No messages saved on this device.
          </p>
        )}

        {counts.sent > 0 ? (
          <button
            type="button"
            onClick={clearSent}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-slate-500 ring-1 ring-sky-900/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear sent
          </button>
        ) : null}
        {!CONTACT_ENDPOINT && !CONTACT_EMAIL ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-[#9a5a00] ring-1 ring-amber-900/10">
            Contact delivery is waiting for endpoint configuration.
          </p>
        ) : null}
      </section>
    </div>
  );
}
