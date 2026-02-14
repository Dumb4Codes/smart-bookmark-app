"use client";

import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/hooks/useToast";
import { BookmarkCard } from "./BookmarkCard";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { ToastContainer } from "./Toast";

export function BookmarkList() {
  const { bookmarks, loading } = useBookmarks();
  const { toasts, showToast, dismissToast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <AddBookmarkForm
        onSuccess={(msg) => showToast(msg, "success")}
        onError={(msg) => showToast(msg, "error")}
      />

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-500">
            Add your first bookmark to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-600 mb-4">
            {bookmarks.length}{" "}
            {bookmarks.length === 1 ? "Bookmark" : "Bookmarks"}
          </h2>
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={(msg) => showToast(msg, "success")}
              onError={(msg) => showToast(msg, "error")}
            />
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
