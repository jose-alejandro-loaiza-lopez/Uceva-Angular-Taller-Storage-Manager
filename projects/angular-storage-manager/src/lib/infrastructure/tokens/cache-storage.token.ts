import { InjectionToken } from '@angular/core';

/**
 * Resuelve la API `CacheStorage` de forma segura.
 *
 * Devuelve `null` cuando el entorno no la soporta.
 */
function resolveCacheStorage(): CacheStorage | null {
  try {
    return typeof globalThis.caches === 'undefined' ? null : globalThis.caches;
  } catch {
    return null;
  }
}

/**
 * Token de inyección para la API de cachés del navegador.
 *
 * Es interno de la librería: no forma parte de la API pública.
 */
export const CACHE_STORAGE = new InjectionToken<CacheStorage | null>('CACHE_STORAGE', {
  providedIn: 'root',
  factory: resolveCacheStorage,
});
