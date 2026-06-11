import { WomensRenewalActions } from "@/components/womens-renewal-actions";
import {
  renewalFaqs,
  renewalHighlights,
  renewalIncludes,
  renewalSchedule,
  renewalTeachers,
} from "@/lib/womens-renewal";
import type { Metadata } from "next";
import { CalendarDays, Check, ChevronDown, CircleHelp, Clock3, ExternalLink, Heart, MapPin, Sparkles, Utensils } from "lucide-react";

export const metadata: Metadata = {
  title: "A Woman's Renewal Experience | 3HO Summer Solstice 2026",
  description: "Offline-friendly event details and registration reminder for A Woman's Renewal Experience, June 29-July 1, 2026.",
};

export default function WomensRenewalPage() {
  return (
    <div className="space-y-5">
      <section className="relative -mx-1 min-h-[28rem] overflow-hidden rounded-2xl bg-sky-50 shadow-[0_24px_64px_rgba(47,98,182,0.18)] sm:mx-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/womens-renewal/hero.jpg"
          alt="Hacienda Guru Ram Das Ashram landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/88 via-white/62 to-white/18" />
        <div className="relative flex min-h-[28rem] flex-col justify-between p-5 sm:p-7">
          <div className="max-w-xl">
            <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.055em] text-[#2f62b6] sm:text-6xl">
              A Woman&apos;s Renewal Experience
            </h1>
            <p className="mt-4 max-w-md text-lg font-black leading-7 text-slate-900">
              Continue your Solstice journey with three days of practice, rest and integration.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white/88 p-3 shadow-sm ring-1 ring-sky-900/10">
              <CalendarDays className="h-5 w-5 text-[#f39200]" />
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Dates</p>
              <p className="mt-1 text-sm font-black text-slate-950">June 29-July 1, 2026</p>
            </div>
            <div className="rounded-xl bg-white/88 p-3 shadow-sm ring-1 ring-sky-900/10">
              <MapPin className="h-5 w-5 text-[#f39200]" />
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Venue</p>
              <p className="mt-1 text-sm font-black text-slate-950">Hacienda Guru Ram Das Ashram</p>
            </div>
            <div className="rounded-xl bg-white/88 p-3 shadow-sm ring-1 ring-sky-900/10">
              <Heart className="h-5 w-5 text-[#f39200]" />
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Rate</p>
              <p className="mt-1 text-sm font-black text-slate-950">Early Bird $255</p>
            </div>
          </div>
        </div>
      </section>

      <WomensRenewalActions />

      <section className="grid gap-3 sm:grid-cols-3">
        {renewalHighlights.map((highlight) => (
          <article key={highlight} className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
            <Sparkles className="h-5 w-5 text-[#f39200]" />
            <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{highlight}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.08)]">
        <div className="grid gap-0 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-96 sm:min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/womens-renewal/circle.jpg"
              alt="Women meditating in a circle"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          <div className="p-5 sm:p-6">
            <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">What you get</p>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.035em] text-[#2f62b6]">
              A quieter landing after Solstice
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This is designed as a natural continuation after Summer Solstice: an in-person women&apos;s experience to reset your nervous system, reconnect with intuition and carry the teachings into daily life.
            </p>

            <div className="mt-5 grid gap-2">
              {renewalIncludes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-sky-50 px-3 py-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm font-bold leading-5 text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#f39200]/20 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <Utensils className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5a00]" />
                <div>
                  <p className="text-sm font-black text-[#9a5a00]">Meals included. Lodging is not included.</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    The venue is about a 20-minute drive from Ram Das Puri, with nearby access to everyday essentials in Espanola.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Program</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2f62b6]">Three-day flow</h2>
        </div>

        <div className="grid gap-3">
          {renewalSchedule.map((day) => (
            <article key={day.day} className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#f39200]">
                    {day.day} · {day.date}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">{day.focus}</h3>
                </div>
                <Clock3 className="h-5 w-5 shrink-0 text-[#2f62b6]" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {day.items.map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Teachers</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2f62b6]">Women leading the experience</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {renewalTeachers.map((teacher) => (
            <article key={teacher.name} className="flex items-center gap-3 rounded-xl border border-sky-900/10 bg-white p-3 shadow-sm">
              {teacher.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={teacher.image} alt={teacher.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                </>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-lg font-black text-[#2f62b6]">
                  {teacher.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>
              )}
              <div>
                <h3 className="text-base font-black leading-tight text-slate-950">{teacher.name}</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{teacher.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#2f62b6] p-5 text-white shadow-[0_18px_48px_rgba(47,98,182,0.18)]">
        <h2 className="text-2xl font-black tracking-[-0.03em]">Member savings</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-sky-50">
          3HO Premium members and active IKYTA members can receive an additional $50 off with a member-only code at checkout.
        </p>
        <a
          href="#renewal-faq"
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#2f62b6]"
        >
          Read the FAQ
          <CircleHelp className="h-4 w-4" />
        </a>
      </section>

      <section id="renewal-faq" className="scroll-mt-20 space-y-3">
        <div className="px-1">
          <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">FAQ</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2f62b6]">Woman&apos;s Renewal questions</h2>
        </div>

        <div className="grid gap-3">
          {renewalFaqs.map((faq, index) => (
            <details
              key={faq.question}
              open={index === 0}
              className="group rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <span className="text-base font-black leading-6 text-slate-950">{faq.question}</span>
                <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-[#2f62b6] transition group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-2">
                {faq.answer.map((paragraph) => (
                  <p key={paragraph} className="text-sm font-semibold leading-6 text-slate-600">
                    {paragraph}
                  </p>
                ))}
                {"links" in faq && faq.links ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {faq.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-900/10 bg-sky-50 px-3 py-2 text-xs font-black text-[#2f62b6]"
                      >
                        {link.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
