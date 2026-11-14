import type { CacheRequest } from '../models/cache-request.model';

/**
 * Contrato público del servicio de `Cache Storage`.
 *
 * Expone operaciones asíncronas para administrar cachés, almacenar respuestas
 * HTTP y recuperar o eliminar recursos.
 */
export interface CacheStorageServiceContract {
  /**
   * Indica si la API `CacheStorage` está disponible en el entorno actual.
   *
   * @returns `true` si el navegador soporta `Cache Storage`; de lo contrario, `false`.
   */
  isSupported(): boolean;

  /**
   * Comprueba si una caché existe.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché existe; de lo contrario, `false`.
   */
  has(cacheName: string): Promise<boolean>;

  /**
   * Crea una caché si no existe.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché fue creada; `false` si ya existía.
   */
  create(cacheName: string): Promise<boolean>;

  /**
   * Abre una caché. Si no existe, el navegador la crea.
   *
   * @param cacheName Nombre de la caché.
   * @returns La instancia nativa de la caché.
   */
  open(cacheName: string): Promise<Cache>;

  /**
   * Obtiene los nombres de todas las cachés del origen actual.
   *
   * @returns Lista de nombres de cachés.
   */
  keys(): Promise<string[]>;

  /**
   * Almacena una respuesta HTTP asociada a un recurso.
   *
   * Si la caché no existe, se crea automáticamente.
   *
   * @param cacheName Nombre de la caché.
   * @param request URL o `Request` del recurso.
   * @param response Respuesta HTTP que se desea almacenar.
   */
  put(cacheName: string, request: CacheRequest, response: Response): Promise<void>;

  /**
   * Recupera la respuesta asociada a un recurso.
   *
   * @param cacheName Nombre de la caché.
   * @param request URL o `Request` del recurso.
   * @returns La respuesta almacenada, o `undefined` si no existe el recurso o la caché.
   */
  match(cacheName: string, request: CacheRequest): Promise<Response | undefined>;

  /**
   * Recupera todas las respuestas almacenadas en una caché o las que coincidan
   * con un recurso.
   *
   * @param cacheName Nombre de la caché.
   * @param request Recurso opcional para filtrar los resultados.
   * @returns Lista de respuestas encontradas; vacía si la caché no existe.
   */
  matchAll(cacheName: string, request?: CacheRequest): Promise<readonly Response[]>;

  /**
   * Elimina un recurso de una caché.
   *
   * @param cacheName Nombre de la caché.
   * @param request URL o `Request` del recurso.
   * @returns `true` si el recurso existía; `false` si no existía o la caché no existe.
   */
  remove(cacheName: string, request: CacheRequest): Promise<boolean>;

  /**
   * Elimina todos los recursos de una caché sin borrar la caché.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché existía y se vació; `false` si no existe.
   */
  clear(cacheName: string): Promise<boolean>;

  /**
   * Elimina una caché completa con todos sus recursos.
   *
   * @param cacheName Nombre de la caché.
   * @returns `true` si la caché existía y se eliminó; `false` si no existía.
   */
  delete(cacheName: string): Promise<boolean>;
}
