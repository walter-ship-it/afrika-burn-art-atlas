
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, Route } from 'workbox-routing';
import { setCacheNameDetails } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & { 
  __WB_MANIFEST: Array<{url: string, revision: string | null}> 
};

// Fix for addEventListener not found on ServiceWorkerGlobalScope
declare global {
  interface ServiceWorkerGlobalScope {
    addEventListener(
      type: 'install' | 'activate',
      listener: (event: ExtendedEvent) => void
    ): void;
    addEventListener(
      type: 'fetch',
      listener: (event: FetchEvent) => void
    ): void;
    skipWaiting(): Promise<void>;
    clients: Clients;
  }

  interface ExtendedEvent extends Event {
    waitUntil(promise: Promise<any>): void;
  }

  interface FetchEvent extends Event {
    request: Request;
    respondWith(response: Promise<Response> | Response): void;
    waitUntil(promise: Promise<any>): void;
  }

  interface Clients {
    claim(): Promise<void>;
    matchAll(options?: { type?: string, includeUncontrolled?: boolean }): Promise<Client[]>;
  }
  
  interface Client {
    id: string;
    url: string;
    postMessage(message: any): void;
    navigate(url: string): Promise<Client>;
  }
}

// Set cache names for better organization
setCacheNameDetails({
  prefix: 'art-atlas',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime'
});

const CACHE_NAME = 'art-atlas-offline-v1';
const HTML_CACHE_NAME = 'art-atlas-html-v1';
const ASSET_CACHE_NAME = 'art-atlas-assets-v1';
const DATA_CACHE_NAME = 'art-atlas-data-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_FALLBACK_IMAGE = '/lovable-uploads/88cf2c86-ed43-4d55-a4d0-4cf74740daea.png'; // Backup map image

// Precache all webpack-generated assets and critical files
const precacheAssets = self.__WB_MANIFEST.concat([
  { url: '/', revision: null },
  { url: '/index.html', revision: null },
  { url: '/manifest.json', revision: null },
  { url: OFFLINE_FALLBACK_IMAGE, revision: null },
  { url: '/img/map.png', revision: null }
]);

precacheAndRoute(precacheAssets);

// Install event - prepare cache and skip waiting for immediate activation
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    Promise.all([
      // Cache the offline page
      caches.open(HTML_CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Pre-caching offline page');
        
        // Create a simple offline fallback page
        const offlineResponse = new Response(
          `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - AfrikaBurn Art Atlas</title>
            <style>
              body { font-family: system-ui, sans-serif; text-align: center; padding: 20px; color: #333; }
              h1 { color: #059669; }
              .offline-container { max-width: 500px; margin: 0 auto; }
              .try-again-btn { background: #059669; color: white; border: none; padding: 10px 20px; 
                              border-radius: 4px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="offline-container">
              <h1>You're Offline</h1>
              <p>The AfrikaBurn Art Atlas is currently not available because you're offline.</p>
              <p>Your cached map and installations data should be available.</p>
              <button class="try-again-btn" onclick="window.location.reload()">Try Again</button>
            </div>
          </body>
          </html>
          `, 
          {
            headers: new Headers({
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache'
            })
          }
        );
        
        return cache.put(OFFLINE_URL, offlineResponse);
      }),
      
      // Warm up the map image cache
      caches.open(ASSET_CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Pre-caching map assets');
        return cache.addAll([
          '/img/map.png',
          OFFLINE_FALLBACK_IMAGE,
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png',
          '/icons/apple-touch-icon.png'
        ]);
      }),
      
      // Warm up the data cache by pre-fetching CSV
      caches.open(DATA_CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Pre-caching data');
        return cache.add('https://raw.githubusercontent.com/walter-ship-it/afrika-burn-art-atlas/main/keys.csv');
      })
    ]).then(() => {
      console.log('[ServiceWorker] Skip waiting on install');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  // Clean up old cache versions
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== HTML_CACHE_NAME && 
                cacheName !== ASSET_CACHE_NAME && 
                cacheName !== DATA_CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients as soon as activated
      self.clients.claim()
    ])
  );
});

// Serve HTML shell with a stale-while-revalidate strategy
// This ensures we always have something to show, even if network is slow
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: HTML_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60, // 1 Day
      }),
    ],
  })
);

// Cache map images with a cache-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/img/') || 
               url.pathname.startsWith('/tiles/') || 
               url.pathname.startsWith('/lovable-uploads/') ||
               url.pathname.startsWith('/icons/'),
  new CacheFirst({
    cacheName: ASSET_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache CSV data with a stale-while-revalidate strategy for better offline support
registerRoute(
  ({ url }) => url.href.includes('walter-ship-it/afrika-burn-art-atlas/main/keys.csv'),
  new StaleWhileRevalidate({
    cacheName: DATA_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 24 * 60 * 60, // 1 Day
      }),
    ],
  })
);

// Cache CSS, JS and other static assets
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: ASSET_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
      }),
    ],
  })
);

// Manifest.json should be cached but always fresh
registerRoute(
  ({ url }) => url.pathname === '/manifest.json',
  new StaleWhileRevalidate({
    cacheName: ASSET_CACHE_NAME
  })
);

// Special handling for all fetch events - improved offline handling
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // For navigation requests, try the network first but fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          console.log('[ServiceWorker] Fetch failed, returning offline page instead.');
          return caches.match(OFFLINE_URL) || caches.match('/index.html');
        })
    );
    return;
  }
  
  // For non-navigate requests, try the cache first with network fallback
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if we have it
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try the network
        return fetch(request)
          .then(response => {
            // If we got a valid response, clone it and cache it
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              
              // Determine which cache to use based on the request type
              let cacheName = ASSET_CACHE_NAME;
              if (request.destination === 'document') {
                cacheName = HTML_CACHE_NAME;
              } else if (request.url.includes('keys.csv')) {
                cacheName = DATA_CACHE_NAME;
              }
              
              caches.open(cacheName).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(error => {
            console.error('[ServiceWorker] Fetch failed:', error);
            
            // If this is an image, try to return our fallback map image
            if (request.destination === 'image') {
              return caches.match(OFFLINE_FALLBACK_IMAGE);
            }
            
            // Return a generic offline response for other resources
            return new Response('Resource not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-store'
              }),
            });
          });
      })
  );
});
