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
    // Fetch initial bookmarks
    async function fetchBookmarks() {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookmarks(data);
      }
      setLoading(false);
    }

    fetchBookmarks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark;
            setBookmarks((current) => {
              // Remove any temporary optimistic bookmarks
              const withoutTemp = current.filter(
                (b) => !b.id.startsWith("temp-"),
              );
              // Check if bookmark already exists (avoid duplicates)
              const exists = withoutTemp.some((b) => b.id === newBookmark.id);
              if (exists) return withoutTemp;
              // Add the new bookmark
              return [newBookmark, ...withoutTemp];
            });
          } else if (payload.eventType === "DELETE") {
            const oldBookmark = payload.old as Bookmark;
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== oldBookmark.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { bookmarks, loading, setBookmarks };
}
