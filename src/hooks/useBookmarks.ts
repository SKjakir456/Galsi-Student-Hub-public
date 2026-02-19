import { useState, useCallback, useEffect } from 'react';

export interface BookmarkedNotice {
  id: string;
  title: string;
  date: string;
  url: string;
  isNew?: boolean;
  isImportant?: boolean;
  category?: string;
}

const STORAGE_KEY = 'galsi_bookmarks';

function loadBookmarks(): BookmarkedNotice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: BookmarkedNotice[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks:', e);
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedNotice[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const toggleBookmark = useCallback((notice: BookmarkedNotice) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === notice.id);
      if (exists) {
        return prev.filter(b => b.id !== notice.id);
      }
      return [notice, ...prev];
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, clearBookmarks };
}
