import { inject, Injectable } from '@angular/core';
import { StorageError, type StorageErrorCode } from '../../core/errors/storage.error';
import type { CacheStorageServiceContract } from '../../core/interfaces/cache-storage-service.interface';
import type { CacheRequest } from '../../core/models/cache-request.model';
import { CACHE_STORAGE } from '../../infrastructure/tokens/cache-storage.token';

/**
 * Servicio para administrar recursos mediante la API `Cache Storage`.
 *
 * Permite crear cachés, almacenar respuestas HTTP, consultar recursos,
 * eliminar elementos y borrar cachés completas. Todas las operaciones son
 * asíncronas y los errores nativos se transforman en {@link StorageError}.
 *
 * @example
 * ```ts
 * const cache = inject(CacheStorageService);
 * await cache.put('app-v1', 'https://example.com/data.json', new Response('{}'));
 * const response = await cache.match('app-v1', 'https://example.com/data.json');
 * await cache.remove('app-v1', 'https://example.com/data.json');
 * await cache.delete('app-v1');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CacheStorageService implements CacheStorageServiceContract {
  private readonly cacheStorage = inject(CACHE_STORAGE);

  /**
   * Indica si la API `CacheStorage` está disponible en el entorno actual.
   *
   * @returns `true` si el navegador soporta `Cache Storage`; de lo contrario, `false`.
   */
  isSupported(): boolean {
    return this.cacheStorage !== null;
  }

  /**
   * Comprueba si una caché existe.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché existe; de lo contrario, `false`.
   * @throws {StorageError} Con código `CACHE_READ_FAILED` si la consulta falla y
   * `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async has(cacheName: string): Promise<boolean> {
    const cacheStorage = this.requireCacheStorage();

    try {
      return await cacheStorage.has(cacheName);
    } catch (error) {
      throw this.wrap(
        'CACHE_READ_FAILED',
        `No se pudo comprobar la caché "${cacheName}".`,
        error,
      );
    }
  }

  /**
   * Crea una caché si no existe.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché fue creada; `false` si ya existía.
   * @throws {StorageError} Con código `CACHE_OPEN_FAILED` si la creación falla y
   * `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async create(cacheName: string): Promise<boolean> {
    const cacheStorage = this.requireCacheStorage();

    if (await this.has(cacheName)) {
      return false;
    }

    try {
      await cacheStorage.open(cacheName);
      return true;
    } catch (error) {
      throw this.wrap('CACHE_OPEN_FAILED', `No se pudo crear la caché "${cacheName}".`, error);
    }
  }

  /**
   * Abre una caché. Si no existe, el navegador la crea.
   *
   * @param cacheName Nombre de la caché.
   * @returns La instancia nativa de la caché.
   * @throws {StorageError} Con código `CACHE_OPEN_FAILED` si la apertura falla y
   * `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async open(cacheName: string): Promise<Cache> {
    const cacheStorage = this.requireCacheStorage();

    try {
      return await cacheStorage.open(cacheName);
    } catch (error) {
      throw this.wrap('CACHE_OPEN_FAILED', `No se pudo abrir la caché "${cacheName}".`, error);
    }
  }

  /**
   * Obtiene los nombres de todas las cachés del origen actual.
   *
   * @returns Lista de nombres de cachés.
   * @throws {StorageError} Con código `CACHE_READ_FAILED` si la consulta falla y
   * `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async keys(): Promise<string[]> {
    const cacheStorage = this.requireCacheStorage();

    try {
      return await cacheStorage.keys();
    } catch (error) {
      throw this.wrap('CACHE_READ_FAILED', 'No se pudieron obtener las cachés.', error);
    }
  }

  /**
   * Almacena una respuesta HTTP asociada a un recurso.
   *
   * Si la caché no existe, se crea automáticamente.
   *
   * @param cacheName Nombre de la caché.
   * @param request URL absoluta o `Request` del recurso.
   * @param response Respuesta HTTP que se desea almacenar.
   * @throws {StorageError} Con código `CACHE_WRITE_FAILED` si el almacenamiento
   * falla y `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async put(cacheName: string, request: CacheRequest, response: Response): Promise<void> {
    const cacheStorage = this.requireCacheStorage();

    try {
      const cache = await cacheStorage.open(cacheName);
      await cache.put(request, response);
    } catch (error) {
      throw this.wrap(
        'CACHE_WRITE_FAILED',
        `No se pudo almacenar el recurso en la caché "${cacheName}".`,
        error,
      );
    }
  }

  /**
   * Recupera la respuesta asociada a un recurso.
   *
   * @param cacheName Nombre de la caché.
   * @param request URL absoluta o `Request` del recurso.
   * @returns La respuesta almacenada, o `undefined` si no existe el recurso o la caché.
   * @throws {StorageError} Con código `CACHE_READ_FAILED` si la consulta falla y
   * `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async match(cacheName: string, request: CacheRequest): Promise<Response | undefined> {
    const cacheStorage = this.requireCacheStorage();

    try {
      if (!(await cacheStorage.has(cacheName))) {
        return undefined;
      }

      const cache = await cacheStorage.open(cacheName);
      return await cache.match(request);
    } catch (error) {
      throw this.wrap(
        'CACHE_READ_FAILED',
        `No se pudo consultar el recurso en la caché "${cacheName}".`,
        error,
      );
    }
  }

  /**
   * Recupera todas las respuestas almacenadas en una caché o las que coincidan
   * con un recurso.
   *
   * @param cacheName Nombre de la caché.
   * @param request Recurso opcional para filtrar los resultados.
   * @returns Lista de respuestas encontradas; vacía si la caché no existe.
   * @throws {StorageError} Con código `CACHE_READ_FAILED` si la consulta falla y
   * `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async matchAll(cacheName: string, request?: CacheRequest): Promise<readonly Response[]> {
    const cacheStorage = this.requireCacheStorage();

    try {
      if (!(await cacheStorage.has(cacheName))) {
        return [];
      }

      const cache = await cacheStorage.open(cacheName);

      if (request === undefined) {
        return await cache.matchAll();
      }

      return await cache.matchAll(request);
    } catch (error) {
      throw this.wrap(
        'CACHE_READ_FAILED',
        `No se pudieron consultar los recursos de la caché "${cacheName}".`,
        error,
      );
    }
  }

  /**
   * Elimina un recurso de una caché.
   *
   * @param cacheName Nombre de la caché.
   * @param request URL absoluta o `Request` del recurso.
   * @returns `true` si el recurso existía; `false` si no existía o la caché no existe.
   * @throws {StorageError} Con código `CACHE_DELETE_FAILED` si la eliminación
   * falla y `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async remove(cacheName: string, request: CacheRequest): Promise<boolean> {
    const cacheStorage = this.requireCacheStorage();

    try {
      if (!(await cacheStorage.has(cacheName))) {
        return false;
      }

      const cache = await cacheStorage.open(cacheName);
      return await cache.delete(request);
    } catch (error) {
      throw this.wrap(
        'CACHE_DELETE_FAILED',
        `No se pudo eliminar el recurso de la caché "${cacheName}".`,
        error,
      );
    }
  }

  /**
   * Elimina todos los recursos de una caché sin borrar la caché.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché existía y se vació; `false` si no existe.
   * @throws {StorageError} Con código `CACHE_DELETE_FAILED` si la eliminación
   * falla y `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async clear(cacheName: string): Promise<boolean> {
    const cacheStorage = this.requireCacheStorage();

    try {
      if (!(await cacheStorage.has(cacheName))) {
        return false;
      }

      const cache = await cacheStorage.open(cacheName);
      const requests = await cache.keys();
      await Promise.all(requests.map((request) => cache.delete(request)));
      return true;
    } catch (error) {
      throw this.wrap(
        'CACHE_DELETE_FAILED',
        `No se pudo vaciar la caché "${cacheName}".`,
        error,
      );
    }
  }

  /**
   * Elimina una caché completa con todos sus recursos.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché existía y se eliminó; `false` si no existía.
   * @throws {StorageError} Con código `CACHE_DELETE_FAILED` si la eliminación
   * falla y `CACHE_UNAVAILABLE` si la API no está disponible.
   */
  async delete(cacheName: string): Promise<boolean> {
    const cacheStorage = this.requireCacheStorage();

    try {
      return await cacheStorage.delete(cacheName);
    } catch (error) {
      throw this.wrap('CACHE_DELETE_FAILED', `No se pudo eliminar la caché "${cacheName}".`, error);
    }
  }

  /**
   * Verifica que `CacheStorage` esté disponible antes de operar.
   */
  private requireCacheStorage(): CacheStorage {
    if (this.cacheStorage === null) {
      throw new StorageError(
        'CACHE_UNAVAILABLE',
        'Cache Storage no está disponible en este entorno.',
      );
    }

    return this.cacheStorage;
  }

  /**
   * Conserva los errores propios y envuelve los nativos del navegador.
   */
  private wrap(code: StorageErrorCode, message: string, error: unknown): StorageError {
    return error instanceof StorageError ? error : new StorageError(code, message, { cause: error });
  }
}
