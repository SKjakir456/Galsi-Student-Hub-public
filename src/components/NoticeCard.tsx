import { forwardRef, useState, memo } from 'react';
import { 
  ExternalLink, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Download, 
  Loader2,
  BarChart2,
  Calendar,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Award,
  PartyPopper,
  AlertTriangle,
  LayoutGrid,
  Bookmark,
  BookmarkCheck,
  LucideIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useBookmarks } from '@/hooks/useBookmarks';

interface Notice {
  id: string;
  title: string;
  date: string;
  url: string;
  isNew?: boolean;
  isImportant?: boolean;
  category?: string;
}

interface NoticeCardProps {
  notice: Notice;
  index: number;
}

const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  result: { icon: BarChart2, label: 'Result', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  routine: { icon: Calendar, label: 'Routine', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  syllabus: { icon: BookOpen, label: 'Syllabus', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  exam: { icon: ClipboardList, label: 'Exam', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  admission: { icon: GraduationCap, label: 'Admission', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  scholarship: { icon: Award, label: 'Scholarship', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  holiday: { icon: PartyPopper, label: 'Holiday', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  important: { icon: AlertTriangle, label: 'Important', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  general: { icon: LayoutGrid, label: 'General', color: 'bg-muted text-muted-foreground border-border' },
};

export const NoticeCard = memo(forwardRef<HTMLDivElement, NoticeCardProps>(
  function NoticeCard({ notice, index }, ref) {
    const formattedDate = new Date(notice.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const isPdf = notice.url.toLowerCase().endsWith('.pdf');
    const categoryConfig = CATEGORY_CONFIG[notice.category || 'general'] || CATEGORY_CONFIG.general;

    const [isDownloading, setIsDownloading] = useState(false);
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const bookmarked = isBookmarked(notice.id);

    const handleProxyDownload = async () => {
      setIsDownloading(true);
      try {
        const { data, error } = await supabase.functions.invoke('proxy-download', {
          body: { url: notice.url }
        });

        if (error) throw error;

        // Create blob and trigger download
        const blob = new Blob([data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = notice.title.replace(/[^a-zA-Z0-9\s]/g, '') + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Proxy download failed:', error);
        // Fallback to direct link
        window.open(notice.url, '_blank', 'noopener,noreferrer');
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <div
        ref={ref}
        className="glass-card-elevated p-4 md:p-6 hover-lift group animate-fade-in"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="flex flex-col gap-3">
          {/* Header with badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {formattedDate}
            </span>
            {notice.category && notice.category !== 'general' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                <categoryConfig.icon className="w-3 h-3" />
                {categoryConfig.label}
              </span>
            )}
            {notice.isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary text-xs font-bold border border-primary/20">
                <Sparkles className="w-3 h-3" />
                NEW
              </span>
            )}
            {notice.isImportant && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20">
                <AlertCircle className="w-3 h-3" />
                Important
              </span>
            )}
            {isPdf && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <FileText className="w-3 h-3" />
                PDF
              </span>
            )}
          </div>
          
          {/* Title - full width, no truncation on mobile */}
          <h3 className="text-sm md:text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
            {notice.title}
          </h3>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-1 flex-wrap">
            <a
              href={notice.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
            <Button
              variant="glass"
              size="sm"
              className="gap-1.5 shadow-sm"
              onClick={handleProxyDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="text-xs">{isDownloading ? 'Loading...' : 'Download'}</span>
            </Button>
            <button
              onClick={() => toggleBookmark(notice)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                bookmarked
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border/50 bg-background/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Save notice'}
              title={bookmarked ? 'Remove bookmark' : 'Save notice'}
            >
              {bookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
));