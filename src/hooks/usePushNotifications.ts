import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | null;
}

// Convert VAPID key to Uint8Array for push subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: null,
  });

  const vapidPublicKeyRef = useRef<string | null>(null);

  const getVapidPublicKey = useCallback(async () => {
    if (vapidPublicKeyRef.current) return vapidPublicKeyRef.current;

    const { data, error } = await supabase.functions.invoke('vapid-public-key');
    if (error) throw error;

    const key = data?.publicKey as string | undefined;
    if (!key) throw new Error('Missing VAPID public key');

    vapidPublicKeyRef.current = key;
    return key;
  }, []);

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : null,
    }));

    return isSupported;
  }, []);

  // Recheck permission state (call on page load/focus)
  const recheckPermission = useCallback(() => {
    if ('Notification' in window) {
      setState((prev) => ({
        ...prev,
        permission: Notification.permission,
      }));
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, []);

  const saveSubscriptionToDb = useCallback(async (subscription: PushSubscription) => {
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    if (!p256dhKey || !authKey) {
      throw new Error('Failed to get subscription keys');
    }

    const p256dh = arrayBufferToBase64Url(p256dhKey);
    const auth = arrayBufferToBase64Url(authKey);

    // Keep DB clean: ensure only one row per endpoint.
    await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);

    const { error } = await supabase.from('push_subscriptions').insert({
      endpoint: subscription.endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
    });

    if (error) throw error;
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }));
        return;
      }

      // Ensure this browser subscription exists in the database (so server can send pushes)
      try {
        await saveSubscriptionToDb(subscription);
        setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false }));
      } catch (e) {
        console.error('Error saving existing subscription:', e);
        // Subscription exists locally but not persisted; treat as not subscribed for reliability.
        setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [saveSubscriptionToDb]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission !== 'granted') {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Notification permission denied' };
      }

      const registration = await navigator.serviceWorker.ready;

      // If a subscription already exists (possibly tied to old VAPID keys), force a clean re-subscribe.
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', existing.endpoint);
        await existing.unsubscribe();
      }

      const vapidPublicKey = await getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      console.log('Push subscription created:', subscription);

      await saveSubscriptionToDb(subscription);

      setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Failed to subscribe' };
    }
  }, [getVapidPublicKey, saveSubscriptionToDb]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
        await subscription.unsubscribe();
      }

      setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Failed to unsubscribe' };
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!checkSupport()) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await registerServiceWorker();
      await checkSubscription();
    };

    init();
  }, [checkSupport, registerServiceWorker, checkSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    recheckPermission,
  };
}
