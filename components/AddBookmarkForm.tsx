"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

interface AddBookmarkFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function AddBookmarkForm({ onSuccess, onError }: AddBookmarkFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Validate URL format
  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      onError("Please fill in all fields");
      return;
    }

    if (!isValidUrl(url)) {
      onError("Please enter a valid URL (must start with http:// or https://)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        onError("You must be logged in");
        return;
      }

      // Insert bookmark
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        title: title.trim(),
        url: url.trim(),
      });

      if (error) throw error;

      // Reset form
      setTitle("");
      setUrl("");
      onSuccess("Bookmark added successfully!");
    } catch (error) {
      console.error("Error adding bookmark:", error);
      onError("Failed to add bookmark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm p-6 mb-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Add New Bookmark
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Favorite Site"
            autoFocus
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Bookmark"}
        </button>
      </div>
    </form>
  );
}
