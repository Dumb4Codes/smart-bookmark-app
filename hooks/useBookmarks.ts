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
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((current) => {
            // Check if already exists to prevent duplicates
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
          const deletedBookmark = payload.old as Bookmark;
          setBookmarks((current) =>
            current.filter((bookmark) => bookmark.id !== deletedBookmark.id),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { bookmarks, loading, setBookmarks };
}
