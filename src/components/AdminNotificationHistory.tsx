import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Timer,
  BarChart2,
  Calendar,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Award,
  PartyPopper,
  AlertTriangle,
  LayoutGrid,
  LucideIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from './ui/skeleton';

interface NotificationHistoryItem {
  id: string;
  notice_title: string;
  category: string;
  sent_at: string;
  subscribers_count: number;
  successful: number;
  failed: number;
  triggered_by: string;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  result: BarChart2,
  routine: Calendar,
  syllabus: BookOpen,
  exam: ClipboardList,
  admission: GraduationCap,
  scholarship: Award,
  holiday: PartyPopper,
  important: AlertTriangle,
  general: LayoutGrid,
};

export function AdminNotificationHistory() {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('notification_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching notification history:', err);
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHistory}>
          Retry
        </Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No notifications sent yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Recent Notifications</span>
        <Button variant="ghost" size="sm" onClick={fetchHistory} className="h-6 w-6 p-0">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="bg-muted/50 rounded-lg p-2.5 text-xs space-y-1.5"
          >
            <div className="flex items-start gap-2">
              {(() => {
                const CategoryIcon = CATEGORY_ICONS[item.category] || LayoutGrid;
                return <CategoryIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />;
              })()}
              <p className="font-medium text-foreground line-clamp-2 flex-1 leading-tight">
                {item.notice_title}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  item.triggered_by === 'auto' 
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {item.triggered_by === 'auto' ? (
                    <Timer className="w-2.5 h-2.5" />
                  ) : (
                    <Zap className="w-2.5 h-2.5" />
                  )}
                  {item.triggered_by === 'auto' ? 'Auto' : 'Manual'}
                </span>
                
                <span className="flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {item.successful}
                </span>
                
                {item.failed > 0 && (
                  <span className="flex items-center gap-0.5 text-destructive">
                    <XCircle className="w-3 h-3" />
                    {item.failed}
                  </span>
                )}
              </div>
              
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(item.sent_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}