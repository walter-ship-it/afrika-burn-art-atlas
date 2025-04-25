
/// <reference lib="webworker" />
export {};

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

const sw = self as unknown as ServiceWorkerGlobalScope;

/* 1. Precache Vite manifest + explicit "./" */
precacheAndRoute(sw.__WB_MANIFEST.concat([{ url: './', revision: null }]));

// ---------- 2. cache-first map assets ----------
registerRoute(
  ({ url }) => url.pathname.startsWith('/img/') || url.pathname.startsWith('/tiles/'),
  new CacheFirst({
    cacheName: 'map-images',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 2592000 })],
  })
);

// ---------- 3. stale-while-revalidate CSV (was NetworkFirst) ----------
registerRoute(
  ({ url }) => url.href.includes('afrika-burn-art-atlas/main/keys.csv'),
  new NetworkFirst({
    cacheName: 'csv-data',
    plugins: [new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 86400 })],
  })
);

// ---------- 4. navigation fallback ----------
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-shell',
    networkTimeoutSeconds: 3,
  })
);

// ---------- 5. offline fallback for uncached stuff ----------
sw.addEventListener('fetch', (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ?? new Response('Offline and not in cache', { status: 503 })
      )
    );
  }
});

// Take immediate control of all clients
sw.addEventListener('install', () => sw.skipWaiting());
sw.addEventListener('activate', () => sw.clients.claim());
