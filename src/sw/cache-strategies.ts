
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CACHE_CONFIG } from './config';

export const setupCacheStrategies = () => {
  // Serve HTML shell with a stale-while-revalidate strategy
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new StaleWhileRevalidate({
      cacheName: CACHE_CONFIG.HTML_CACHE_NAME,
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
    ({ url }) => 
      url.pathname.startsWith('/img/') || 
      url.pathname.startsWith('/tiles/') || 
      url.pathname.startsWith('/lovable-uploads/') ||
      url.pathname.startsWith('/icons/'),
    new CacheFirst({
      cacheName: CACHE_CONFIG.ASSET_CACHE_NAME,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache CSV data with a stale-while-revalidate strategy
  registerRoute(
    ({ url }) => url.href.includes('walter-ship-it/afrika-burn-art-atlas/main/keys.csv'),
    new StaleWhileRevalidate({
      cacheName: CACHE_CONFIG.DATA_CACHE_NAME,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 5,
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    })
  );

  // Cache static assets
  registerRoute(
    ({ request }) => 
      request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'font',
    new StaleWhileRevalidate({
      cacheName: CACHE_CONFIG.ASSET_CACHE_NAME,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
        }),
      ],
    })
  );

  // Manifest.json strategy
  registerRoute(
    ({ url }) => url.pathname === '/manifest.json',
    new StaleWhileRevalidate({
      cacheName: CACHE_CONFIG.ASSET_CACHE_NAME
    })
  );
};
