"use client";

/**
 * News & posts: every post for the event being viewed (everyone's posts plus
 * the active event's own), newest first with pinned ones on top. Reads from
 * the local store, so anything already fetched is available offline; the
 * HomeFeedAgent keeps it fresh while online.
 */

import { useMemo, useState } from "react";
import { Newspaper, RefreshCw } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { PostCard, PostSheet } from "@/components/post-card";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { refreshHomeFeed, useHomeEvents, useHomePosts, visiblePosts, type HomePost } from "@/lib/home-feed";
import { BUILTIN_EVENT_SLUG } from "@/lib/messages";

export default function NewsPage() {
  const posts = useHomePosts();
  const catalog = useHomeEvents();
  const active = useActiveSyncedEvent();
  const [open, setOpen] = useState<HomePost | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const activeSlug = active ? active.slug : BUILTIN_EVENT_SLUG;
  const visible = useMemo(() => visiblePosts(posts, activeSlug), [posts, activeSlug]);
  const eventNames = useMemo(() => {
    const names = new Map(catalog.map((event) => [event.slug, event.name]));
    if (active) names.set(active.slug, active.name);
    return names;
  }, [catalog, active]);

  async function refreshNow() {
    setRefreshing(true);
    try {
      await refreshHomeFeed();
    } catch {
      // Offline or unreachable — the stored posts below stay available.
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-4">
      <ActiveEventBanner />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f39200]">From 3HO</p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#2f62b6]">News & posts</h1>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            News, registration openings and notices from the event team. Saved on your device once received.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshNow}
          disabled={refreshing}
          aria-label="Check for new posts"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2f62b6] shadow-sm ring-1 ring-sky-900/10 transition hover:bg-sky-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <Newspaper className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">No posts yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">News and notices from 3HO will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((post, index) => (
            <PostCard key={post.id} post={post} featured={index === 0} eventName={post.eventSlug ? eventNames.get(post.eventSlug) : undefined} onOpen={setOpen} />
          ))}
        </div>
      )}

      {open && <PostSheet post={open} eventName={open.eventSlug ? eventNames.get(open.eventSlug) : undefined} onClose={() => setOpen(null)} />}
    </div>
  );
}
