"use client";

/**
 * Home "News & posts": the newest posts for the event being viewed (everyone's
 * posts plus the active event's own), from the local store, with a detail
 * sheet and a link to the full list. Renders nothing until a post exists.
 */

import { useMemo, useState } from "react";
import { ChevronRight, Newspaper } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { PostCard, PostSheet } from "@/components/post-card";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { useHomeEvents, useHomePosts, visiblePosts, type HomePost } from "@/lib/home-feed";
import { BUILTIN_EVENT_SLUG } from "@/lib/messages";

const SHOWN = 3;

export function HomeNews() {
  const posts = useHomePosts();
  const catalog = useHomeEvents();
  const active = useActiveSyncedEvent();
  const [open, setOpen] = useState<HomePost | null>(null);

  const activeSlug = active ? active.slug : BUILTIN_EVENT_SLUG;
  const visible = useMemo(() => visiblePosts(posts, activeSlug), [posts, activeSlug]);
  const eventNames = useMemo(() => {
    const names = new Map(catalog.map((event) => [event.slug, event.name]));
    if (active) names.set(active.slug, active.name);
    return names;
  }, [catalog, active]);

  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="home-news-title">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-[#f39200]" aria-hidden />
          <h2 id="home-news-title" className="text-xs font-black uppercase tracking-[0.18em] text-[#f39200]">
            News & posts
          </h2>
        </div>
        {visible.length > SHOWN && (
          <Link href="/news" className="inline-flex items-center gap-0.5 text-xs font-black text-[#2f62b6]">
            See all
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {visible.slice(0, SHOWN).map((post, index) => (
          <PostCard key={post.id} post={post} featured={index === 0} eventName={post.eventSlug ? eventNames.get(post.eventSlug) : undefined} onOpen={setOpen} />
        ))}
      </div>

      {open && <PostSheet post={open} eventName={open.eventSlug ? eventNames.get(open.eventSlug) : undefined} onClose={() => setOpen(null)} />}
    </section>
  );
}
