
import { precacheAndRoute } from 'workbox-precaching';
import { CACHE_CONFIG } from './config';

declare const self: ServiceWorkerGlobalScope & { 
  __WB_MANIFEST: Array<{url: string, revision: string | null}> 
};

export const setupPrecache = () => {
  const precacheAssets = self.__WB_MANIFEST.concat([
    { url: '/', revision: null },
    { url: '/index.html', revision: null },
    { url: '/manifest.json', revision: null },
    { url: CACHE_CONFIG.OFFLINE_FALLBACK_IMAGE, revision: null },
    { url: '/img/map.png', revision: null }
  ]);

  precacheAndRoute(precacheAssets);
};
