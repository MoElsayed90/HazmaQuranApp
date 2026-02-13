"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bookmark } from "@/lib/api/types";

interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, "createdAt">) => void;
  removeBookmark: (surahId: number, ayahNumber: number) => void;
  isBookmarked: (surahId: number, ayahNumber: number) => boolean;
  clearAll: () => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (bookmark) =>
        set((state) => {
          // Don't add duplicates
          const exists = state.bookmarks.some(
            (b) =>
              b.surahId === bookmark.surahId &&
              b.ayahNumber === bookmark.ayahNumber
          );
          if (exists) return state;

          return {
            bookmarks: [
              { ...bookmark, createdAt: Date.now() },
              ...state.bookmarks,
            ],
          };
        }),

      removeBookmark: (surahId, ayahNumber) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => !(b.surahId === surahId && b.ayahNumber === ayahNumber)
          ),
        })),

      isBookmarked: (surahId, ayahNumber) =>
        get().bookmarks.some(
          (b) => b.surahId === surahId && b.ayahNumber === ayahNumber
        ),

      clearAll: () => set({ bookmarks: [] }),
    }),
    {
      name: "quran-bookmarks",
    }
  )
);
