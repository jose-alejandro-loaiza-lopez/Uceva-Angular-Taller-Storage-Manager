/**
 * Códigos que identifican la causa de un error producido por la librería.
 *
 * Permiten a los consumidores reaccionar de forma específica sin depender del
 * mensaje de error ni de la implementación interna del navegador.
 */
export type StorageErrorCode =
  | 'STORAGE_UNAVAILABLE'
  | 'SERIALIZATION_FAILED'
  | 'DESERIALIZATION_FAILED'
  | 'WRITE_FAILED'
  | 'READ_FAILED'
  | 'REMOVE_FAILED'
  | 'CLEAR_FAILED'
  | 'CACHE_UNAVAILABLE'
  | 'CACHE_OPEN_FAILED'
  | 'CACHE_WRITE_FAILED'
  | 'CACHE_READ_FAILED'
  | 'CACHE_DELETE_FAILED';

/**
 * Error lanzado por los servicios de la librería.
 *
 * Envuelve los errores nativos del navegador (por ejemplo, `QuotaExceededError`
 * o `SecurityError`) en un único tipo predecible.
 *
 * @example
 * ```ts
 * try {
 *   localStorageService.set('user', user);
 * } catch (error) {
 *   if (error instanceof StorageError && error.code === 'WRITE_FAILED') {
 *     // La cuota de almacenamiento se agotó o el acceso fue bloqueado.
 *   }
 * }
 * ```
 */
export class StorageError extends Error {
  /**
   * Código que identifica el tipo de fallo.
   */
  readonly code: StorageErrorCode;

  /**
   * Error original emitido por el navegador, si existe.
   */
  override readonly cause?: unknown;

  /**
   * Crea una instancia de `StorageError`.
   *
   * @param code Código que identifica el tipo de fallo.
   * @param message Mensaje descriptivo para el desarrollador.
   * @param options Opciones adicionales; `cause` conserva el error original.
   */
  constructor(
    code: StorageErrorCode,
    message: string,
    options?: {
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.cause = options?.cause;
  }
}
