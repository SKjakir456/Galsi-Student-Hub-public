import { Bookmark, Trash2, ExternalLink, FileText, Sparkles, AlertCircle, BarChart2, Calendar, BookOpen, ClipboardList, GraduationCap, Award, PartyPopper, AlertTriangle, LayoutGrid } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  result: { label: 'Result', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  routine: { label: 'Routine', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  syllabus: { label: 'Syllabus', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  exam: { label: 'Exam', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  admission: { label: 'Admission', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  scholarship: { label: 'Scholarship', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  holiday: { label: 'Holiday', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  important: { label: 'Important', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  general: { label: 'General', color: 'bg-muted text-muted-foreground border-border' },
};

interface BookmarksPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookmarksPanel({ open, onOpenChange }: BookmarksPanelProps) {
  const { bookmarks, clearBookmarks, toggleBookmark } = useBookmarks();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bookmark className="w-4 h-4 text-primary" />
              Saved Notices
              {bookmarks.length > 0 && (
                <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {bookmarks.length}
                </span>
              )}
            </SheetTitle>
            {bookmarks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive gap-1.5 h-8"
                onClick={clearBookmarks}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap the bookmark icon on any notice to save it here for quick access — even offline.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bookmarks.map((notice) => {
                const categoryConfig = CATEGORY_CONFIG[notice.category || 'general'] || CATEGORY_CONFIG.general;
                const isPdf = notice.url.toLowerCase().endsWith('.pdf');
                const formattedDate = new Date(notice.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div key={notice.id} className="p-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className="text-xs text-muted-foreground">{formattedDate}</span>
                          {notice.category && notice.category !== 'general' && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                              {categoryConfig.label}
                            </span>
                          )}
                          {notice.isNew && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                              <Sparkles className="w-2.5 h-2.5" />
                              NEW
                            </span>
                          )}
                          {notice.isImportant && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Important
                            </span>
                          )}
                          {isPdf && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                              <FileText className="w-2.5 h-2.5" />
                              PDF
                            </span>
                          )}
                        </div>
                        {/* Title */}
                        <p className="text-sm font-medium text-foreground leading-snug">{notice.title}</p>
                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={notice.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                          <span className="text-border">·</span>
                          <button
                            onClick={() => toggleBookmark(notice)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
