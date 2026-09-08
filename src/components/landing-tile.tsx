import { AppLink as Link } from "@/components/app-link";
import { landingHref, type Landing } from "@/lib/landings";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * The promo card that announces a landing on an event's home: kicker, title,
 * summary, "See details" and the landing's card image with a soft fade.
 * Server-renderable; the built-in landings are part of the static export.
 */
export function LandingTile({ landing }: { landing: Landing }) {
  const image = landing.cardImage ?? landing.hero?.image;
  const alt = landing.cardImageAlt ?? landing.hero?.alt ?? "";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#f39200]/25 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.11)]">
      <div className={image ? "grid min-h-44 grid-cols-[minmax(0,1fr)_7.25rem] sm:grid-cols-[minmax(0,1fr)_13rem]" : "grid min-h-44"}>
        <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
          {landing.kicker && (
            <div className="flex items-center gap-2 text-[#f39200]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">{landing.kicker}</p>
            </div>
          )}
          <h2 className="mt-2 text-2xl font-black leading-[1.02] tracking-[-0.04em] text-[#2f62b6] sm:text-3xl">{landing.title}</h2>
          {landing.summary && <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{landing.summary}</p>}
          <Link
            href={landingHref(landing)}
            className="mt-3 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#2f62b6] px-4 py-2.5 text-sm font-black text-white"
          >
            See details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {image && (
          <div className="relative min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/18 to-transparent sm:from-white/72" />
          </div>
        )}
      </div>
    </section>
  );
}
