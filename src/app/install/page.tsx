import type { Metadata } from "next";
import { AppLink as Link } from "@/components/app-link";
import {
  ArrowRight,
  Check,
  Download,
  MoreVertical,
  Share,
  Smartphone,
  SquarePlus,
  TabletSmartphone,
  WifiOff,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Add to Home Screen | 3HO Event App",
  description:
    "Step-by-step guide to add the 3HO Event App to your home screen on iPhone (iOS) and Android for fast, offline access.",
};

const iosSteps = [
  {
    text: (
      <>
        Open this site in <strong>Safari</strong> (it must be Safari, not Chrome or another browser).
      </>
    ),
  },
  {
    text: (
      <>
        Tap the <strong>Share</strong> button
        <Share className="mx-1 inline h-4 w-4 align-text-bottom text-[#2f62b6]" />
        at the bottom of the screen.
      </>
    ),
  },
  {
    text: (
      <>
        Scroll down and tap <strong>Add to Home Screen</strong>
        <SquarePlus className="mx-1 inline h-4 w-4 align-text-bottom text-[#2f62b6]" />.
      </>
    ),
  },
  {
    text: (
      <>
        Tap <strong>Add</strong> in the top-right corner. The 3HO icon will appear on your home screen.
      </>
    ),
  },
];

const androidSteps = [
  {
    text: (
      <>
        Open this site in <strong>Chrome</strong>.
      </>
    ),
  },
  {
    text: (
      <>
        Tap the <strong>menu</strong>
        <MoreVertical className="mx-1 inline h-4 w-4 align-text-bottom text-[#2f62b6]" />
        (three dots) in the top-right corner.
      </>
    ),
  },
  {
    text: (
      <>
        Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>
        <Download className="mx-1 inline h-4 w-4 align-text-bottom text-[#2f62b6]" />.
      </>
    ),
  },
  {
    text: (
      <>
        Confirm by tapping <strong>Install</strong> (or <strong>Add</strong>). The 3HO icon will appear on your home screen.
      </>
    ),
  },
];

function StepList({ steps }: { steps: { text: React.ReactNode }[] }) {
  return (
    <ol className="mt-4 space-y-3">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f62b6] text-sm font-black text-white">
            {index + 1}
          </span>
          <span className="pt-0.5 text-sm font-semibold leading-6 text-slate-700">{step.text}</span>
        </li>
      ))}
    </ol>
  );
}

export default function InstallPage() {
  return (
    <div className="space-y-5">
      <section className="relative -mx-1 overflow-hidden rounded-2xl bg-[#1d3f94] px-6 pb-7 pt-8 text-white shadow-[0_24px_64px_rgba(18,51,130,0.30)] sm:mx-0 sm:px-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="absolute -bottom-16 left-4 h-48 w-48 rounded-full bg-[#f39200]/15 blur-3xl" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5">
            <Smartphone className="h-3.5 w-3.5 text-[#f39200]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Install the app</span>
          </div>
          <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl">
            Add to Home Screen
          </h1>
          <p className="max-w-xl text-sm font-semibold leading-6 text-white/75">
            Install the 3HO Event App on your phone for one-tap access, full-screen view, and content that
            works even without signal at camp.
          </p>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
          <WifiOff className="h-5 w-5 text-[#f39200]" />
          <p className="mt-2 text-sm font-black text-slate-950">Works offline</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Program, map and info available without signal.</p>
        </div>
        <div className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
          <Smartphone className="h-5 w-5 text-[#f39200]" />
          <p className="mt-2 text-sm font-black text-slate-950">Full screen</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Opens like an app, no browser bars.</p>
        </div>
        <div className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
          <ArrowRight className="h-5 w-5 text-[#f39200]" />
          <p className="mt-2 text-sm font-black text-slate-950">One tap</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Launch straight from your home screen.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.08)]">
        <div className="flex items-center gap-3 border-b border-sky-900/10 bg-sky-50 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#2f62b6] shadow-sm ring-1 ring-sky-200/70">
            <Share className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">iPhone &amp; iPad</p>
            <h2 className="text-xl font-black text-slate-950">iOS · Safari</h2>
          </div>
        </div>
        <div className="px-5 py-4">
          <StepList steps={iosSteps} />
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-orange-50 px-3 py-2.5 ring-1 ring-[#f39200]/20">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9a5a00]" />
            <p className="text-xs font-semibold leading-5 text-slate-600">
              On iPhone you must use <strong>Safari</strong>. The &ldquo;Add to Home Screen&rdquo; option is not available in
              Chrome or other browsers on iOS.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.08)]">
        <div className="flex items-center gap-3 border-b border-sky-900/10 bg-sky-50 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#2f62b6] shadow-sm ring-1 ring-sky-200/70">
            <TabletSmartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f39200]">Phone &amp; tablet</p>
            <h2 className="text-xl font-black text-slate-950">Android · Chrome</h2>
          </div>
        </div>
        <div className="px-5 py-4">
          <StepList steps={androidSteps} />
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-orange-50 px-3 py-2.5 ring-1 ring-[#f39200]/20">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9a5a00]" />
            <p className="text-xs font-semibold leading-5 text-slate-600">
              Some phones may show a banner offering to install the app automatically. You can tap that, or follow the steps
              above at any time.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-[#2f62b6] p-5 text-white shadow-[0_18px_48px_rgba(47,98,182,0.18)]">
        <h2 className="text-xl font-black tracking-[-0.02em]">Already installed?</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-sky-50">
          Open the app from your home screen and keep it open while connected at least once so all program, map and info
          content downloads for offline use.
        </p>
        <Link
          href="/info"
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#2f62b6]"
        >
          Back to Info Hub
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
