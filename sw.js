const CACHE_NAME = 'bhumidekho-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Push Notification Handler (for background notifications)
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received:', event);

    let data = {
        title: '💬 New Message',
        body: 'You have a new message',
        icon: '/logo.png',
        badge: '/logo.png'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body || 'You have a new message',
        icon: data.icon || '/logo.png',
        badge: data.badge || '/logo.png',
        vibrate: [200, 100, 200],
        tag: 'chat-message',
        requireInteraction: false,
        data: {
            url: data.url || '/',
            chatId: data.chatId
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '💬 BhumiDekho', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Check if app is already open
            for (let client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window if not open
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Background Sync (for offline message sending)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);

    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // Sync pending messages when back online
    console.log('📤 Syncing messages...');
    // Implementation will be added based on your needs
}
