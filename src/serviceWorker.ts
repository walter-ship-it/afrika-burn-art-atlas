
/// <reference lib="webworker" />
export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

import { setCacheNameDetails } from 'workbox-core';
import { SW_CONFIG } from './sw/config';
import { setupCacheStrategies } from './sw/cache-strategies';
import { setupPrecache } from './sw/precache';
import { handleFetch } from './sw/fetch-handler';

// Set cache names for better organization
setCacheNameDetails(SW_CONFIG);

// Set up precaching
setupPrecache();

// Set up cache strategies
setupCacheStrategies();

// Install event - prepare cache and skip waiting for immediate activation
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(sw.skipWaiting());
});

// Activate event - clean old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(sw.clients.claim());
});

// Special handling for all fetch events
self.addEventListener('fetch', (event) => {
  handleFetch(event);
});
