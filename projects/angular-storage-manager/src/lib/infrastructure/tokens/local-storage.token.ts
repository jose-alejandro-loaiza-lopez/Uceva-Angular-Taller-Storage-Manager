import { InjectionToken } from '@angular/core';

/**
 * Resuelve `localStorage` de forma segura.
 *
 * Devuelve `null` en entornos sin navegador (SSR, Node) o cuando el acceso está
 * bloqueado por la configuración de privacidad.
 */
function resolveLocalStorage(): Storage | null {
  try {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}

/**
 * Token de inyección para el almacenamiento local del navegador.
 *
 * Es interno de la librería: no forma parte de la API pública.
 */
export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: resolveLocalStorage,
});
