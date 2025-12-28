import { ArrowRight, RefreshCw, Loader2, Clock, Radio, SearchX, WifiOff, AlertCircle, Inbox, Sparkles } from 'lucide-react';
import { NoticeCard } from './NoticeCard';
import { NoticeSearch } from './NoticeSearch';
import { NoticeCategoryFilter } from './NoticeCategoryFilter';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useQuery } from '@tanstack/react-query';
import { noticesApi, Notice } from '@/lib/api/notices';
import { useToast } from '@/hooks/use-toast';
import { NotificationSubscribe } from './NotificationSubscribe';
import { useState, useEffect, useMemo } from 'react';
import { fuzzySearch } from '@/lib/fuzzySearch';

function NoticeCardSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="glass-card-elevated p-5 md:p-6 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

const CACHE_KEY = 'galsi_notices_cache';

function loadCachedNotices(): Notice[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { notices, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return notices;
      }
    }
  } catch (e) {
    console.error('Failed to load cached notices:', e);
  }
  return null;
}

function cacheNotices(notices: Notice[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      notices,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.error('Failed to cache notices:', e);
  }
}

function isWithinLastDays(dateStr: string, days: number): boolean {
  const noticeDate = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - noticeDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function NoticesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const { toast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedNotices] = useState<Notice[] | null>(() => loadCachedNotices());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data, isLoading, isError, error, refetch, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      console.log('Fetching notices...');
      const response = await noticesApi.fetchNotices();
      console.log('Notices response:', response);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch notices');
      }
      if (!response.notices?.length) {
        console.log('No notices in response');
        return [];
      }
      cacheNotices(response.notices);
      console.log('Returning notices:', response.notices.length);
      return response.notices;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    refetchIntervalInBackground: false, // Only refresh when tab is active
    refetchOnWindowFocus: true, // Refresh when user comes back to the tab
    retry: 2,
  });

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastRefreshed(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  const notices = data || cachedNotices || [];
  const isUsingCache = !data && !!cachedNotices;

  // Apply search first, then calculate category counts from search results
  const searchFilteredNotices = useMemo(() => {
    const sorted = [...notices]
      .map(notice => ({
        ...notice,
        isNew: isWithinLastDays(notice.date, 3),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (!searchQuery.trim()) {
      return { notices: sorted, isFuzzyMatch: false };
    }
    
    const results = fuzzySearch(sorted, searchQuery, notice => notice.title);
    const hasExactMatch = results.some(r => r.isExactMatch);
    
    return {
      notices: results.map(r => r.item),
      isFuzzyMatch: results.length > 0 && !hasExactMatch,
    };
  }, [notices, searchQuery]);

  // Calculate category counts from search-filtered notices
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    searchFilteredNotices.notices.forEach(notice => {
      const cat = notice.category || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [searchFilteredNotices.notices]);

  // Apply category filter on top of search results
  const { filteredNotices, isFuzzyMatch } = useMemo(() => {
    let result = searchFilteredNotices.notices;
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(notice => (notice.category || 'general') === selectedCategory);
    }
    
    return {
      filteredNotices: result,
      isFuzzyMatch: searchFilteredNotices.isFuzzyMatch,
    };
  }, [searchFilteredNotices, selectedCategory]);

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Notices Refreshed",
      description: "Latest notices have been fetched from the college website.",
    });
  };

  const formatLastRefreshed = (date: Date | null) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <section id="notices" className="pt-4 pb-16 md:py-24 relative" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <div className={`reveal ${isVisible ? 'visible' : ''}`}>
          {/* Section Header */}
          <div className="mb-6 md:mb-10">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Updates
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Last checked: {formatLastRefreshed(lastRefreshed)}
              </div>
              {!isOnline && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </div>
              )}
              {isUsingCache && isOnline && (
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  (showing cached)
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
                    Latest Notices
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground max-w-lg">
                    Official announcements from{' '}
                    <a 
                      href="https://galsimahavidyalaya.ac.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      galsimahavidyalaya.ac.in
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <NotificationSubscribe />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleRefresh}
                    disabled={isLoading || isRefetching || !isOnline}
                  >
                    {isLoading || isRefetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center gap-3 flex-wrap">
                <NoticeSearch value={searchQuery} onChange={setSearchQuery} />
                {searchQuery && (
                  <span className="text-xs text-muted-foreground">
                    {filteredNotices.length} result{filteredNotices.length !== 1 ? 's' : ''}
                    {isFuzzyMatch && (
                      <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-3 h-3" />
                        closest matches
                      </span>
                    )}
                  </span>
                )}
              </div>
              
              {/* Category Filter */}
              {notices.length > 0 && (
                <NoticeCategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categoryCounts={categoryCounts}
                />
              )}
            </div>
          </div>

          {/* Offline State */}
          {!isOnline && notices.length === 0 && (
            <div className="glass-card p-8 md:p-12 text-center">
              <WifiOff className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">You're offline</h3>
              <p className="text-sm text-muted-foreground">
                Connect to the internet to view the latest notices.
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && notices.length === 0 && (
            <div className="glass-card p-8 md:p-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to fetch updates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Please try again later.'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {/* Loading State - Skeleton Cards */}
          {isLoading && notices.length === 0 && (
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {[0, 1, 2, 3, 4].map((index) => (
                <NoticeCardSkeleton key={index} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && notices.length === 0 && isOnline && (
            <div className="glass-card p-8 md:p-12 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notices available</h3>
              <p className="text-sm text-muted-foreground">
                Check back later for new announcements.
              </p>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && (searchQuery || selectedCategory) && filteredNotices.length === 0 && notices.length > 0 && (
            <div className="glass-card p-8 md:p-12 text-center">
              <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? `No notices match "${searchQuery}".` : 'No notices in this category.'}
              </p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
                Clear filters
              </Button>
            </div>
          )}

          {/* Notices Grid */}
          {!isLoading && filteredNotices.length > 0 && (
            <div className={`space-y-3 md:space-y-4 mb-6 md:mb-8 stagger-children ${isVisible ? 'visible' : ''}`}>
              {filteredNotices.slice(0, 10).map((notice, index) => (
                <NoticeCard key={notice.id} notice={notice} index={index} />
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="text-center">
            <Button variant="ghost" size="sm" className="gap-2 group text-sm md:text-base" asChild>
              <a href="https://galsimahavidyalaya.ac.in/category/notice/" target="_blank" rel="noopener noreferrer">
                View All on Official Website
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}