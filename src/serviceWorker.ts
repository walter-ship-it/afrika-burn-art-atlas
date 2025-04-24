
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
    networkTimeoutSeconds: 3, // Reduced timeout for better responsiveness
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

// Handle all fetch events with a cache-first fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Try network, if that fails return a custom offline response
        return fetch(event.request)
          .catch(() => {
            return new Response('Content is not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
  );
});

