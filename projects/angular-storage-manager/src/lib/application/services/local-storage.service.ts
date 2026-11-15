import { inject, Injectable } from '@angular/core';
import { StorageError } from '../../core/errors/storage.error';
import type { LocalStorageServiceContract } from '../../core/interfaces/local-storage-service.interface';
import { LOCAL_STORAGE } from '../../infrastructure/tokens/local-storage.token';

/**
 * Servicio para administrar información en el `LocalStorage` del navegador.
 *
 * Serializa los valores con JSON, de modo que admite primitivos y objetos
 * serializables. Los errores nativos del navegador se transforman en
 * {@link StorageError} para que el consumidor pueda manejarlos de forma
 * consistente.
 *
 * @example
 * ```ts
 * const storage = inject(LocalStorageService);
 * storage.set('profile', { name: 'Ana', active: true });
 * const profile = storage.get<{ name: string; active: boolean }>('profile');
 * storage.update('profile', { name: 'Ana', active: false });
 * storage.remove('profile');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService implements LocalStorageServiceContract {
  /**
   * Almacenamiento local resuelto para el entorno actual.
   *
   * Es `null` cuando el navegador no lo expone (SSR o acceso bloqueado).
   */
  private readonly storage = inject(LOCAL_STORAGE);

  /**
   * Guarda un valor asociado a una clave. Si la clave ya existe, la sobrescribe.
   *
   * @typeParam T Tipo del valor almacenado.
   * @param key Clave única del valor.
   * @param value Valor serializable a JSON.
   * @throws {StorageError} Con código `SERIALIZATION_FAILED` si el valor no se
   * puede serializar, `WRITE_FAILED` si la escritura falla y
   * `STORAGE_UNAVAILABLE` si `LocalStorage` no está disponible.
   */
  set<T>(key: string, value: T): void {
    const storage = this.requireStorage();
    const serialized = this.serialize(key, value);

    try {
      storage.setItem(key, serialized);
    } catch (error) {
      throw new StorageError('WRITE_FAILED', `No se pudo guardar la clave "${key}".`, {
        cause: error,
      });
    }
  }

  /**
   * Recupera y deserializa el valor asociado a una clave.
   *
   * @typeParam T Tipo esperado del valor almacenado.
   * @param key Clave del valor.
   * @returns El valor deserializado, o `null` si la clave no existe.
   * @throws {StorageError} Con código `DESERIALIZATION_FAILED` si el contenido
   * almacenado no es un JSON válido, `READ_FAILED` si la lectura falla y
   * `STORAGE_UNAVAILABLE` si `LocalStorage` no está disponible.
   */
  get<T>(key: string): T | null {
    const storage = this.requireStorage();
    let rawValue: string | null;

    try {
      rawValue = storage.getItem(key);
    } catch (error) {
      throw new StorageError('READ_FAILED', `No se pudo leer la clave "${key}".`, {
        cause: error,
      });
    }

    if (rawValue === null) {
      return null;
    }

    return this.deserialize<T>(key, rawValue);
  }

  /**
   * Indica si una clave existe en el almacenamiento.
   *
   * @param key Clave a comprobar.
   * @returns `true` si la clave existe; de lo contrario, `false`.
   * @throws {StorageError} Con código `READ_FAILED` si la lectura falla y
   * `STORAGE_UNAVAILABLE` si `LocalStorage` no está disponible.
   */
  has(key: string): boolean {
    const storage = this.requireStorage();

    try {
      return storage.getItem(key) !== null;
    } catch (error) {
      throw new StorageError('READ_FAILED', `No se pudo comprobar la clave "${key}".`, {
        cause: error,
      });
    }
  }

  /**
   * Actualiza el valor de una clave existente.
   *
   * @typeParam T Tipo del nuevo valor.
   * @param key Clave a actualizar.
   * @param value Nuevo valor serializable a JSON.
   * @returns `true` si la clave existía y se actualizó; `false` si no existe.
   */
  update<T>(key: string, value: T): boolean {
    if (!this.has(key)) {
      return false;
    }

    this.set(key, value);
    return true;
  }

  /**
   * Elimina una clave y su valor.
   *
   * @param key Clave a eliminar.
   * @returns `true` si la clave existía; `false` si no existía.
   * @throws {StorageError} Con código `REMOVE_FAILED` si la eliminación falla y
   * `STORAGE_UNAVAILABLE` si `LocalStorage` no está disponible.
   */
  remove(key: string): boolean {
    const storage = this.requireStorage();

    try {
      const existed = storage.getItem(key) !== null;
      storage.removeItem(key);
      return existed;
    } catch (error) {
      throw new StorageError('REMOVE_FAILED', `No se pudo eliminar la clave "${key}".`, {
        cause: error,
      });
    }
  }

  /**
   * Elimina todas las claves del `LocalStorage` del origen actual.
   *
   * @throws {StorageError} Con código `CLEAR_FAILED` si la operación falla y
   * `STORAGE_UNAVAILABLE` si `LocalStorage` no está disponible.
   */
  clear(): void {
    const storage = this.requireStorage();

    try {
      storage.clear();
    } catch (error) {
      throw new StorageError('CLEAR_FAILED', 'No se pudo vaciar el LocalStorage.', {
        cause: error,
      });
    }
  }

  /**
   * Obtiene las claves almacenadas en el `LocalStorage` del origen actual.
   *
   * @returns Lista de claves existentes.
   * @throws {StorageError} Con código `READ_FAILED` si la lectura falla y
   * `STORAGE_UNAVAILABLE` si `LocalStorage` no está disponible.
   */
  keys(): string[] {
    const storage = this.requireStorage();

    try {
      const keys: string[] = [];

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);

        if (key !== null) {
          keys.push(key);
        }
      }

      return keys;
    } catch (error) {
      throw new StorageError('READ_FAILED', 'No se pudieron obtener las claves.', {
        cause: error,
      });
    }
  }

  /**
   * Verifica que `LocalStorage` esté disponible antes de operar.
   */
  private requireStorage(): Storage {
    if (this.storage === null) {
      throw new StorageError(
        'STORAGE_UNAVAILABLE',
        'LocalStorage no está disponible en este entorno.',
      );
    }

    return this.storage;
  }

  /**
   * Serializa un valor a JSON y valida que el resultado sea almacenable.
   */
  private serialize<T>(key: string, value: T): string {
    if (value === undefined) {
      throw new StorageError(
        'SERIALIZATION_FAILED',
        `El valor de la clave "${key}" es undefined y no se puede serializar.`,
      );
    }

    try {
      const serialized = JSON.stringify(value) as string | undefined;

      if (serialized === undefined) {
        throw new StorageError(
          'SERIALIZATION_FAILED',
          `El valor de la clave "${key}" no es serializable a JSON.`,
        );
      }

      return serialized;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      throw new StorageError(
        'SERIALIZATION_FAILED',
        `El valor de la clave "${key}" no se pudo serializar.`,
        { cause: error },
      );
    }
  }

  /**
   * Deserializa el contenido JSON de una clave.
   */
  private deserialize<T>(key: string, rawValue: string): T {
    try {
      return JSON.parse(rawValue) as T;
    } catch (error) {
      throw new StorageError(
        'DESERIALIZATION_FAILED',
        `El valor de la clave "${key}" no contiene un JSON válido.`,
        { cause: error },
      );
    }
  }
}
