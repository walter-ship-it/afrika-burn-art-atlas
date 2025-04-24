
// Extending the Window interface to include ServiceWorker globals
declare global {
  interface Window extends ServiceWorkerGlobalScope {}
}

// Service worker specific event interfaces
export interface ExtendedEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

export interface FetchEvent extends ExtendedEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  preloadResponse: Promise<any>;
  clientId: string;
  resultingClientId: string;
}

// Service worker global scope
export interface ServiceWorkerGlobalScope extends Window {
  skipWaiting(): Promise<void>;
  clients: Clients;
  registration: ServiceWorkerRegistration;
}

export interface Clients {
  claim(): Promise<void>;
  get(id: string): Promise<Client>;
  matchAll(options?: ClientQueryOptions): Promise<Client[]>;
  openWindow(url: string): Promise<WindowClient>;
}

export interface ClientQueryOptions {
  includeUncontrolled?: boolean;
  type?: ClientTypes;
}

export type ClientTypes = 'window' | 'worker' | 'sharedworker' | 'all';

export interface ServiceWorkerConfig {
  prefix: string;
  suffix: string;
  precache: string;
  runtime: string;
}

export interface CacheConfig {
  CACHE_NAME: string;
  HTML_CACHE_NAME: string;
  ASSET_CACHE_NAME: string;
  DATA_CACHE_NAME: string;
  OFFLINE_URL: string;
  OFFLINE_FALLBACK_IMAGE: string;
}
