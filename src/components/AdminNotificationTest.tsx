import { useState } from 'react';
import { Bell, Send, Loader2, Settings, Users, History } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminSubscriptionsPanel } from './AdminSubscriptionsPanel';
import { AdminNotificationHistory } from './AdminNotificationHistory';

const ADMIN_CODE = 'galsi2024'; // Simple admin code for testing

export function AdminNotificationTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [title, setTitle] = useState('Test Notice');
  const [body, setBody] = useState('This is a test notification from Galsi Mahavidyalaya');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'subscriptions' | 'history'>('notifications');
  const { toast } = useToast();

  const handleAuth = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      toast({ title: "Admin Mode Enabled", description: "You can now send test notifications" });
    } else {
      toast({ title: "Invalid Code", description: "Please enter the correct admin code", variant: "destructive" });
    }
  };

  const sendTestNotification = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: { title, body, url: '/' }
      });

      if (error) throw error;

      toast({
        title: "Notification Sent!",
        description: `Sent to ${data?.sent || 0} subscriber(s), ${data?.failed || 0} failed`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const checkNewNotices = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-new-notices', {
        body: { triggeredBy: 'manual' }
      });

      if (error) throw error;

      toast({
        title: "Check Complete",
        description: `Found ${data?.newNotices || 0} new notices, sent ${data?.notificationsSent || 0} notifications`,
      });
      
      // Refresh history after check
      if (activeTab === 'history') {
        setActiveTab('notifications');
        setTimeout(() => setActiveTab('history'), 100);
      }
    } catch (error) {
      console.error('Error checking notices:', error);
      toast({
        title: "Error",
        description: "Failed to check for new notices",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-100 transition-opacity"
        onClick={() => setIsOpen(true)}
        title="Admin Panel"
      >
        <Settings className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Admin Panel
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          ✕
        </Button>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Enter admin code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />
          <Button onClick={handleAuth} className="w-full">
            Unlock
          </Button>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {/* Tab buttons */}
          <div className="flex gap-1 border-b border-border pb-2">
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('notifications')}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <Send className="w-3 h-3" />
              Send
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <History className="w-3 h-3" />
              History
            </Button>
            <Button
              variant={activeTab === 'subscriptions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('subscriptions')}
              className="flex-1 gap-1 h-8 text-xs"
            >
              <Users className="w-3 h-3" />
              Subs
            </Button>
          </div>

          {activeTab === 'notifications' && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Message</label>
                <Input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification body"
                />
              </div>
              <Button 
                onClick={sendTestNotification} 
                disabled={isSending}
                className="w-full gap-2"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test Notification
              </Button>
              <Button 
                variant="outline"
                onClick={checkNewNotices} 
                disabled={isSending}
                className="w-full gap-2"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                Check for New Notices
              </Button>
            </>
          )}
          
          {activeTab === 'history' && <AdminNotificationHistory />}
          
          {activeTab === 'subscriptions' && <AdminSubscriptionsPanel />}
        </div>
      )}
    </div>
  );
}