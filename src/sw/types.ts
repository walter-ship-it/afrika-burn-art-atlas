
export interface ExtendedEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

export interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  waitUntil(promise: Promise<any>): void;
}

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
