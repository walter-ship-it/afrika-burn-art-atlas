import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { 
  __WB_MANIFEST: Array<{url: string, revision: string | null}> 
};

// Fix for addEventListener not found on ServiceWorkerGlobalScope
declare global {
  interface ServiceWorkerGlobalScope {
    addEventListener(
      type: 'fetch',
      listener: (event: FetchEvent) => void
    ): void;
  }

  interface FetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
  }
}

// Precache all webpack-generated assets
precacheAndRoute(self.__WB_MANIFEST);

// Serve HTML shell while offline with 5s network timeout
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-shell',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 Day
      }),
    ],
  })
);

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

// Remove old offline fallback since we now have proper HTML shell caching
self.addEventListener('fetch', (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || new Response('Offline and resource not cached', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
    );
  }
});
