/*
 * Public API Surface of @josefo_pro/angular-storage-manager
 *
 * Solo se exponen los servicios, contratos, modelos y errores necesarios para
 * consumir la librería. La infraestructura interna (tokens de inyección,
 * serializadores, etc.) permanece oculta.
 */

// Servicios
export { LocalStorageService } from './lib/application/services/local-storage.service';
export { CacheStorageService } from './lib/application/services/cache-storage.service';

// Contratos
export type { LocalStorageServiceContract } from './lib/core/interfaces/local-storage-service.interface';
export type { CacheStorageServiceContract } from './lib/core/interfaces/cache-storage-service.interface';

// Modelos
export type { CacheRequest } from './lib/core/models/cache-request.model';

// Errores
export { StorageError } from './lib/core/errors/storage.error';
export type { StorageErrorCode } from './lib/core/errors/storage.error';
