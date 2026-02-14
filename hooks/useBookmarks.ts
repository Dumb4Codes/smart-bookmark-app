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
    let userId: string | null = null;

    // Fetch initial bookmarks and get user ID
    async function fetchBookmarks() {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      userId = user.id;

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

    // Subscribe to realtime changes - filter by user_id
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
          // Only add if it belongs to current user
          if (userId && newBookmark.user_id === userId) {
            setBookmarks((current) => {
              // Remove any temporary optimistic bookmarks
              const withoutTemp = current.filter(
                (b) => !b.id.startsWith("temp-"),
              );
              // Add the new bookmark if it doesn't already exist
              const exists = withoutTemp.some((b) => b.id === newBookmark.id);
              if (exists) return withoutTemp;
              return [newBookmark, ...withoutTemp];
            });
          }
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
          const deletedId = (payload.old as Bookmark).id;
          setBookmarks((current) =>
            current.filter((bookmark) => bookmark.id !== deletedId),
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
