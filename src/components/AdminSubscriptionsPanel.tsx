import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Subscription {
  id: string;
  endpoint: string;
  created_at: string;
  last_success_at: string | null;
  user_agent: string | null;
}

export function AdminSubscriptionsPanel() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, created_at, last_success_at, user_agent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscriptions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const deleteSubscription = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: 'Deleted',
        description: 'Subscription removed successfully',
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subscription',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const deleteStaleSubscriptions = async () => {
    const stale = subscriptions.filter((s) => {
      // Never had a successful send and older than 1 day
      if (!s.last_success_at) {
        const created = new Date(s.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return created < dayAgo;
      }
      // Last success was more than 7 days ago
      const lastSuccess = new Date(s.last_success_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastSuccess < weekAgo;
    });

    if (stale.length === 0) {
      toast({ title: 'No stale subscriptions', description: 'All subscriptions are active' });
      return;
    }

    setIsLoading(true);
    try {
      const ids = stale.map((s) => s.id);
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setSubscriptions((prev) => prev.filter((s) => !ids.includes(s.id)));
      toast({
        title: 'Cleaned up',
        description: `Removed ${stale.length} stale subscription(s)`,
      });
    } catch (error) {
      console.error('Error deleting stale subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete stale subscriptions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEndpointProvider = (endpoint: string): string => {
    if (endpoint.includes('fcm.googleapis.com')) return 'FCM (Android/Chrome)';
    if (endpoint.includes('mozilla.com')) return 'Mozilla (Firefox)';
    if (endpoint.includes('windows.com')) return 'WNS (Windows)';
    if (endpoint.includes('apple.com')) return 'APNs (Safari)';
    return 'Unknown';
  };

  const isStale = (sub: Subscription): boolean => {
    if (!sub.last_success_at) {
      const created = new Date(sub.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return created < dayAgo;
    }
    const lastSuccess = new Date(sub.last_success_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastSuccess < weekAgo;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subscriptions ({subscriptions.length})</h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSubscriptions}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deleteStaleSubscriptions}
            disabled={isLoading}
            className="text-xs"
          >
            Clean Stale
          </Button>
        </div>
      </div>

      {isLoading && subscriptions.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">No subscriptions</div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`flex items-start justify-between p-2 rounded border text-xs ${
                isStale(sub) ? 'border-destructive/50 bg-destructive/5' : 'border-border'
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-muted-foreground" />
                  <span className="font-medium">{getEndpointProvider(sub.endpoint)}</span>
                  {isStale(sub) && (
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  )}
                </div>
                <div className="text-muted-foreground truncate" title={sub.endpoint}>
                  ...{sub.endpoint.slice(-30)}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created: {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                  </span>
                </div>
                {sub.last_success_at ? (
                  <div className="text-green-600 dark:text-green-400">
                    ✓ Last success: {formatDistanceToNow(new Date(sub.last_success_at), { addSuffix: true })}
                  </div>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400">
                    ⚠ Never delivered
                  </div>
                )}
                {sub.user_agent && (
                  <div className="text-muted-foreground truncate" title={sub.user_agent}>
                    {sub.user_agent.slice(0, 50)}...
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSubscription(sub.id)}
                disabled={isDeleting === sub.id}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
