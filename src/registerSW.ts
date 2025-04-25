
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  scope: '/',
  onRegistered(r) {
    console.log('[SW] Registered:', r?.scope || 'inline');
  },
  onRegisterError(e) {
    console.error('[SW] registration error', e);
  },
});
