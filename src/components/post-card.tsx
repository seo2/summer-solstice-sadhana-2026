"use client";

/**
 * Home posts (news, calls to register, notices): the list card and the
 * detail sheet. Bodies use the plain-text grammar shared with info pages, so
 * staff write them in wp-admin without markup. Links open outside the app —
 * the app never sells anything itself.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ExternalLink, Pin, X } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { formatPostDate, type HomePost } from "@/lib/home-feed";
import { parsePlainText, plainTextExcerpt } from "@/lib/plain-text";

const CLOSE_MS = 170;

type CardProps = {
  post: HomePost;
  /** Name of the event the post is scoped to, when it is. */
  eventName?: string;
  /** Magazine layout for the top post: full-width image, bigger title. */
  featured?: boolean;
  onOpen: (post: HomePost) => void;
};

export function PostCard({ post, eventName, featured = false, onOpen }: CardProps) {
  const excerpt = plainTextExcerpt(post.body);
  const when = formatPostDate(post.publishedAt);
  const meta = [when, eventName].filter(Boolean).join(" · ");

  if (featured && post.image) {
    return (
      <article className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.10)]">
        <button type="button" onClick={() => onOpen(post)} className="block w-full text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt="" className="h-44 w-full object-cover sm:h-56" />
          <div className="p-4 sm:p-5">
            {(post.pinned || meta) && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
                {post.pinned && <Pin className="h-3.5 w-3.5 text-[#f39200]" aria-label="Pinned" />}
                {meta && <span>{meta}</span>}
              </p>
            )}
            <h3 className="mt-1.5 text-2xl font-black leading-[1.05] tracking-[-0.03em] text-slate-950 [text-wrap:balance]">{post.title}</h3>
            {excerpt && <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{excerpt}</p>}
            <p className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]">
              Read more
              <ChevronRight className="h-4 w-4" aria-hidden />
            </p>
          </div>
        </button>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-sm">
      <button type="button" onClick={() => onOpen(post)} className="flex w-full items-stretch text-left">
        <div className="min-w-0 flex-1 p-4">
          {(post.pinned || meta) && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
              {post.pinned && <Pin className="h-3.5 w-3.5 text-[#f39200]" aria-label="Pinned" />}
              {meta && <span>{meta}</span>}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 text-[17px] font-black leading-snug text-slate-950">{post.title}</h3>
          {excerpt && <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{excerpt}</p>}
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#2f62b6]">
            Read more
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </p>
        </div>
        {post.image && (
          <div className="relative w-28 shrink-0 sm:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
      </button>
    </article>
  );
}

type SheetProps = {
  post: HomePost;
  eventName?: string;
  onClose: () => void;
};

export function PostSheet({ post, eventName, onClose }: SheetProps) {
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

  const blocks = parsePlainText(post.body);
  const when = formatPostDate(post.publishedAt);
  const meta = [when, eventName].filter(Boolean).join(" · ");

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
        aria-label={post.title}
        className="teacher-modal-card relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white pb-7 shadow-[0_24px_70px_rgba(47,98,182,0.18)] sm:rounded-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-sky-900/10"
        >
          <X className="h-4 w-4" />
        </button>

        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" className="h-48 w-full object-cover sm:h-56 sm:rounded-t-2xl" />
        ) : (
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-stone-200 sm:hidden" />
        )}

        <div className="px-6 pt-5">
          {meta && (
            <p className="teacher-modal-item text-xs font-black uppercase tracking-[0.2em] text-[#2f62b6]" style={{ animationDelay: "40ms" }}>
              {meta}
            </p>
          )}
          <h1 className="teacher-modal-item mt-2 text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950" style={{ animationDelay: "60ms" }}>
            {post.title}
          </h1>

          <div className="teacher-modal-item mt-4 space-y-3" style={{ animationDelay: "100ms" }}>
            {blocks.map((block, index) =>
              block.kind === "paragraph" ? (
                <p key={index} className="text-[15px] leading-7 text-stone-700">
                  {block.text}
                </p>
              ) : (
                <ul key={index} className="space-y-1.5">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[15px] leading-7 text-stone-700">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f39200]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ),
            )}
          </div>

          {post.linkUrl && (
            <Link
              href={post.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="teacher-modal-item mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f62b6] px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(47,98,182,0.24)]"
              style={{ animationDelay: "140ms" }}
            >
              {post.linkLabel ?? "Open link"}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
