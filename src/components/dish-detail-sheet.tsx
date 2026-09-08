"use client";

/**
 * What the kitchen says about one dish — opened from a menu card when the
 * event's dish catalog (bundle `dishes[]`) describes it: photo, what it is,
 * benefits, ingredients, calories per serving and a recipe link. Same sheet
 * mechanics as the activity detail (portal, slide-up on phones, Escape/backdrop
 * to close, reduced-motion aware).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Flame, X } from "lucide-react";
import type { MenuDish } from "@/lib/event-store";

const CLOSE_MS = 170;

type Props = {
  dish: MenuDish;
  /** Where it is served, e.g. "Lunch · Wed, Dec 16". */
  context?: string;
  onClose: () => void;
};

export function DishDetailSheet({ dish, context, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const close = useCallback(() => {
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, [close]);

  let delay = 40;
  const nextDelay = () => {
    delay += 30;
    return { animationDelay: `${delay}ms` };
  };

  return createPortal(
    <div
      className={`teacher-overlay ${closing ? "teacher-overlay-closing" : ""} fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/35 backdrop-blur-sm sm:items-center sm:p-6`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dish.name}
        className="teacher-modal-card activity-detail-card relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl sm:rounded-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-sky-900/10"
        >
          <X className="h-4 w-4" />
        </button>

        {dish.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.photo}
            alt={dish.name}
            className="dish-photo h-48 w-full rounded-t-2xl object-cover sm:h-56"
            loading="lazy"
          />
        )}

        <div className="p-6 pb-7">
          {!dish.photo && <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200 sm:hidden" />}

          {context && (
            <p className="teacher-modal-item text-xs font-black uppercase tracking-[0.24em] text-[#2f62b6]" style={nextDelay()}>
              {context}
            </p>
          )}
          <h1 className="teacher-modal-item mt-2 pr-10 text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950" style={nextDelay()}>
            {dish.name}
          </h1>

          {dish.calories !== undefined && (
            <p className="teacher-modal-item mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-[#9a5a00] ring-1 ring-orange-900/10" style={nextDelay()}>
              <Flame className="h-3.5 w-3.5" aria-hidden />
              {dish.calories} kcal per serving
            </p>
          )}

          {dish.description && (
            <p className="teacher-modal-item mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700" style={nextDelay()}>
              {dish.description}
            </p>
          )}

          {dish.benefits && dish.benefits.length > 0 && (
            <section className="teacher-modal-item mt-5" style={nextDelay()}>
              <h2 className="text-xs font-black uppercase tracking-widest text-stone-400">Benefits</h2>
              <ul className="mt-2 space-y-1.5">
                {dish.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f39200]" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dish.ingredients && dish.ingredients.length > 0 && (
            <section className="teacher-modal-item mt-5" style={nextDelay()}>
              <h2 className="text-xs font-black uppercase tracking-widest text-stone-400">Ingredients</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {dish.ingredients.map((ingredient) => (
                  <li key={ingredient} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-900/10">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dish.recipeUrl && (
            <a
              href={dish.recipeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="teacher-modal-item mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f62b6] px-4 py-3.5 text-sm font-black text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#2f62b6]"
              style={nextDelay()}
            >
              <ExternalLink className="h-[1.05rem] w-[1.05rem]" aria-hidden />
              Open the recipe
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
