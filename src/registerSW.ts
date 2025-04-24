
import { Workbox } from 'workbox-window';
import { useToast } from '@/hooks/use-toast';

// Define proper interface for WorkboxLifecycleEvent
interface WorkboxLifecycleEventHandler {
  isUpdate?: boolean;
  type: string;
  target?: any;
}

declare global {
  interface Window {
    location: Location;
  }
}

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/serviceWorker.js');

    // Track service worker installation progress
    let refreshing = false;

    // Handle updates
    wb.addEventListener('installed', (event: WorkboxLifecycleEventHandler) => {
      console.log('[Service Worker] Installed');
      if (event.isUpdate) {
        if (confirm('New content is available. Reload to update?')) {
          window.location.reload();
        }
      } else {
        console.log('[Service Worker] Content is now available offline!');
        // Could show a toast: "App is ready for offline use"
      }
    });

    // Handle activation
    wb.addEventListener('activated', (event: WorkboxLifecycleEventHandler) => {
      console.log('[Service Worker] Activated');
      if (event.isUpdate) {
        console.log('[Service Worker] Updated');
        // Service worker updated
      } else {
        console.log('[Service Worker] Activated for the first time');
        // First time service worker activation
      }
    });

    // Handle controller change (browser refreshing)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[Service Worker] Content updated in cache');
      }
    });

    // Register the service worker with waiting immediate claim
    wb.register()
      .then((registration) => {
        console.log('[Service Worker] Registered with scope:', registration.scope);
        
        // Check if there's an update waiting
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch((err) => {
        console.error('[Service Worker] Registration failed:', err);
      });
  } else {
    console.log('[Service Worker] Service Workers are not supported in this browser');
  }
};
