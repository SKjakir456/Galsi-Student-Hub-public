// Service Worker for Push Notifications - Galsi Mahavidyalaya

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  
  let data = {
    title: 'GS Hub - Galsi Student Hub',
    body: 'New notice posted!',
    icon: '/logo.png',
    badge: '/logo.png',
    url: '/#notices'
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
      console.log('[Service Worker] Notification data:', data);
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e);
    }
  }
  
  // Determine if URL is external
  const isExternalUrl = data.url && data.url.startsWith('http');
  const actionTitle = isExternalUrl ? 'View on Website' : 'View Notice';
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: actionTitle },
      { action: 'close', title: 'Dismiss' }
    ],
    tag: 'galsi-notice-' + Date.now(),
    renotify: true,
    requireInteraction: true // Keep notification until user interacts
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked:', event.action, event.notification.data);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Get the URL from notification data - use external URL if available
  const notificationData = event.notification.data || {};
  let urlToOpen = notificationData.url || '/';
  
  // If URL is external (starts with http), open directly
  const isExternalUrl = urlToOpen.startsWith('http');
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // For external URLs, always open new window
        if (isExternalUrl) {
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
          return;
        }
        
        // For internal URLs, try to focus existing window first
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activated');
  event.waitUntil(clients.claim());
});
