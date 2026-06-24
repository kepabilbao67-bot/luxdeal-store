/**
 * LUXDEAL - Service Worker
 * =========================
 * Enables offline support, caching, and PWA install.
 * Strategy: Cache First for static assets, Network First for pages.
 */

const CACHE_NAME = 'luxdeal-v1.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/chatbot-ia.css',
    '/script.js',
    '/config-afiliados.js',
    '/daily-deals-engine.js',
    '/chatbot-ia.js',
    '/legal.html',
    '/manifest.json'
];

// Install: Pre-cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker v1.0');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network First for HTML, Cache First for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests (Unsplash images, Google Fonts, etc.)
    if (url.origin !== self.location.origin) {
        // For images, try cache then network
        if (request.destination === 'image') {
            event.respondWith(
                caches.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(response => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                        }
                        return response;
                    }).catch(() => new Response('', { status: 404 }));
                })
            );
            return;
        }
        return;
    }

    // HTML pages: Network First
    if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
        );
        return;
    }

    // Static assets: Cache First
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});

// Background sync for offline actions (future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cart') {
        console.log('[SW] Syncing cart data...');
    }
});

// Push notifications (future)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Nueva oferta disponible!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: 'Ver Oferta' },
            { action: 'close', title: 'Cerrar' }
        ]
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'LUXDEAL Ofertas', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'open' || !event.action) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
