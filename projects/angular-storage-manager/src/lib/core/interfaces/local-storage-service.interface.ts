/**
 * Contrato público del servicio de `LocalStorage`.
 *
 * Define las operaciones disponibles para almacenar, consultar, actualizar y
 * eliminar valores. Los valores se serializan con JSON, por lo que se admiten
 * primitivos y objetos serializables.
 */
export interface LocalStorageServiceContract {
  /**
   * Guarda un valor asociado a una clave. Si la clave ya existe, la sobrescribe.
   *
   * @typeParam T Tipo del valor almacenado.
   * @param key Clave única del valor.
   * @param value Valor serializable a JSON.
   * @throws {StorageError} Si el valor no se puede serializar o la escritura falla.
   */
  set<T>(key: string, value: T): void;

  /**
   * Recupera y deserializa el valor asociado a una clave.
   *
   * @typeParam T Tipo esperado del valor almacenado.
   * @param key Clave del valor.
   * @returns El valor deserializado, o `null` si la clave no existe.
   * @throws {StorageError} Si el valor almacenado no es un JSON válido.
   */
  get<T>(key: string): T | null;

  /**
   * Indica si una clave existe en el almacenamiento.
   *
   * @param key Clave a comprobar.
   * @returns `true` si la clave existe; de lo contrario, `false`.
   */
  has(key: string): boolean;

  /**
   * Actualiza el valor de una clave existente.
   *
   * @typeParam T Tipo del nuevo valor.
   * @param key Clave a actualizar.
   * @param value Nuevo valor serializable a JSON.
   * @returns `true` si la clave existía y se actualizó; `false` si no existe.
   */
  update<T>(key: string, value: T): boolean;

  /**
   * Elimina una clave y su valor.
   *
   * @param key Clave a eliminar.
   * @returns `true` si la clave existía; `false` si no existía.
   */
  remove(key: string): boolean;

  /**
   * Elimina todas las claves del `LocalStorage` del origen actual.
   */
  clear(): void;

  /**
   * Obtiene las claves almacenadas en el `LocalStorage` del origen actual.
   *
   * @returns Lista de claves existentes.
   */
  keys(): string[];
}
