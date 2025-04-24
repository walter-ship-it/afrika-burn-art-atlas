
import { CACHE_CONFIG } from './config';

export const handleFetch = (event: FetchEvent) => {
  const request = event.request;
  
  // For navigation requests, try the network first but fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          console.log('[ServiceWorker] Fetch failed, returning offline page instead.');
          return caches.match(CACHE_CONFIG.OFFLINE_URL) || caches.match('/index.html');
        })
    );
    return;
  }
  
  // For non-navigate requests, try the cache first with network fallback
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then(response => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              
              let cacheName = CACHE_CONFIG.ASSET_CACHE_NAME;
              if (request.destination === 'document') {
                cacheName = CACHE_CONFIG.HTML_CACHE_NAME;
              } else if (request.url.includes('keys.csv')) {
                cacheName = CACHE_CONFIG.DATA_CACHE_NAME;
              }
              
              caches.open(cacheName).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(error => {
            console.error('[ServiceWorker] Fetch failed:', error);
            
            if (request.destination === 'image') {
              return caches.match(CACHE_CONFIG.OFFLINE_FALLBACK_IMAGE);
            }
            
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
};

