
import { Workbox } from 'workbox-window';

declare global {
  interface Window {
    location: Location;
  }
}

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/serviceWorker.js');

    wb.addEventListener('installed', (event: { isUpdate: boolean }) => {
      if (event.isUpdate) {
        if (confirm('New content is available. Reload to update?')) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener('activated', (event: { isUpdate: boolean }) => {
      if (event.isUpdate) {
        console.log('Service worker updated');
      } else {
        console.log('Service worker activated for the first time');
      }
    });

    // Register the service worker
    wb.register()
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  } else {
    console.log('Service Worker is not supported in this browser');
  }
};
