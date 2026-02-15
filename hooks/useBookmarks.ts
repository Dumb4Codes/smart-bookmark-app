"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "@/lib/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtimeSubscription() {
      // Get current user FIRST
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch initial bookmarks
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookmarks(data);
      }
      setLoading(false);

      // Subscribe to realtime changes
      channel = supabase
        .channel("bookmarks-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<Bookmark>) => {
            const newBookmark = payload.new as Bookmark;
            setBookmarks((current) => {
              if (current.some((b) => b.id === newBookmark.id)) {
                return current;
              }
              return [newBookmark, ...current];
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "bookmarks",
          },
          (payload: RealtimePostgresChangesPayload<Bookmark>) => {
            const deletedId = (payload.old as any).id;
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== deletedId),
            );
          },
        )
        .subscribe();
    }

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  return { bookmarks, loading, setBookmarks };
}
