
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { 
  __WB_MANIFEST: Array<{url: string, revision: string | null}> 
};

// Precache all webpack-generated assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache map images with a cache-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/img/') || url.pathname.startsWith('/tiles/'),
  new CacheFirst({
    cacheName: 'map-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache CSV data with network-first strategy
registerRoute(
  ({ url }) => url.href.includes('walter-ship-it/afrika-burn-art-atlas/main/keys.csv'),
  new NetworkFirst({
    cacheName: 'csv-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 24 * 60 * 60, // 1 Day
      }),
    ],
  })
);

// Default handler for navigations - network first with cache fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  })
);

// Handle offline fallback
self.addEventListener('fetch', (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Offline and resource not cached', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
    );
  }
});
