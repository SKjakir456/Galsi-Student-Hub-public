import { Bell, BellOff, BellRing, Loader2, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

const TELEGRAM_CHANNEL = 'https://t.me/galsistudents';
const WHATSAPP_LINK = 'https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20stay%20updated%20about%20Galsi%20Mahavidyalaya%20notices.';

export function NotificationSubscribe() {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe, recheckPermission } = usePushNotifications();
  const { toast } = useToast();

  // Recheck permission on every page load/focus
  useEffect(() => {
    recheckPermission();
    
    const handleFocus = () => recheckPermission();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [recheckPermission]);

  const handleToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe();
      if (result.success) {
        toast({
          title: "Unsubscribed",
          description: "You will no longer receive notice notifications.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to unsubscribe",
          variant: "destructive",
        });
      }
    } else {
      const result = await subscribe();
      if (result.success) {
        toast({
          title: "Subscribed!",
          description: "You will now receive notifications for new important notices.",
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: result.error || "Failed to subscribe to notifications",
          variant: "destructive",
        });
      }
    }
  };

  // Show fallback options if push not supported
  if (!isSupported) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            Get Notified
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Push notifications not available</p>
              <p className="text-xs">Your browser doesn't support push notifications. Use these alternatives:</p>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2" 
                asChild
              >
                <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Join Telegram Channel
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2 text-muted-foreground" 
                asChild
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  Contact via WhatsApp
                </a>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              WhatsApp is for manual contact only — no automated messages.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Show permission denied state with help
  if (permission === 'denied') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-amber-500/50 text-amber-600 dark:text-amber-400"
          >
            <Bell className="w-4 h-4" />
            Click to allow notification
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Notifications blocked</p>
              <p className="text-xs text-muted-foreground">
                To enable, click the lock icon in your browser's address bar and allow notifications.
              </p>
            </div>
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Or use alternatives:</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2" 
                asChild
              >
                <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Join Telegram Channel
                </a>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button 
      variant={isSubscribed ? "secondary" : "outline"}
      size="sm" 
      className="gap-2"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="w-4 h-4" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {isSubscribed ? "Subscribed" : "Enable Notifications"}
    </Button>
  );
}
