
import { setCacheNameDetails } from 'workbox-core';
import { SW_CONFIG } from './sw/config';
import { setupCacheStrategies } from './sw/cache-strategies';
import { setupPrecache } from './sw/precache';
import { handleFetch } from './sw/fetch-handler';
import { ExtendedEvent, FetchEvent } from './sw/types';

// Declare service worker scope for TypeScript
declare const self: ServiceWorkerGlobalScope;

// Set cache names for better organization
setCacheNameDetails(SW_CONFIG);

// Set up precaching
setupPrecache();

// Set up cache strategies
setupCacheStrategies();

// Install event - prepare cache and skip waiting for immediate activation
self.addEventListener('install', (event: ExtendedEvent) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(self.skipWaiting());
});

// Activate event - clean old caches and claim clients
self.addEventListener('activate', (event: ExtendedEvent) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(self.clients.claim());
});

// Special handling for all fetch events
self.addEventListener('fetch', (event: FetchEvent) => {
  handleFetch(event);
});
