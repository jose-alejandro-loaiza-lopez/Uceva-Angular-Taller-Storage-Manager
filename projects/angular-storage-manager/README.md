# @josefo_pro/angular-storage-manager

Librería Angular para gestionar **LocalStorage** y **Cache Storage** con una API tipada, consistente y preparada para manejar errores.

> Documentación completa (Compodoc y ejemplos avanzados) pendiente: **Paso 6** del taller.

## Instalación

```bash
npm install @josefo_pro/angular-storage-manager
```

## Uso rápido

Los servicios son `providedIn: 'root'`, por lo que se pueden inyectar directamente:

```ts
import { Component, inject } from '@angular/core';
import { LocalStorageService, CacheStorageService } from '@josefo_pro/angular-storage-manager';

@Component({
  selector: 'app-demo',
  template: `<button (click)="run()">Probar</button>`,
})
export class DemoComponent {
  private readonly localStorage = inject(LocalStorageService);
  private readonly cacheStorage = inject(CacheStorageService);

  async run(): Promise<void> {
    this.localStorage.set('user', { id: 1, name: 'Ana' });
    const user = this.localStorage.get<{ id: number; name: string }>('user');

    await this.cacheStorage.put('app-v1', 'https://example.com/data.json', await fetch('https://example.com/data.json'));
    const response = await this.cacheStorage.match('app-v1', 'https://example.com/data.json');

    console.log(user, response?.status);
  }
}
```

## API pública

### LocalStorageService

| Método                        | Descripción                                             |
| ----------------------------- | ------------------------------------------------------- |
| `set<T>(key, value)`          | Guarda o sobrescribe un valor serializado con JSON.     |
| `get<T>(key)`                 | Devuelve el valor o `null` si no existe.                |
| `has(key)`                    | Indica si la clave existe.                              |
| `update<T>(key, value)`       | Actualiza una clave existente; retorna `false` si no existe. |
| `remove(key)`                 | Elimina una clave; retorna si existía.                  |
| `clear()`                     | Elimina todas las claves del origen actual.             |
| `keys()`                      | Lista las claves existentes.                            |

### CacheStorageService

| Método                                | Descripción                                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| `isSupported()`                       | Indica si `CacheStorage` está disponible.                          |
| `has(cacheName)`                      | Comprueba si una caché existe.                                     |
| `create(cacheName)`                   | Crea una caché; retorna `false` si ya existía.                     |
| `open(cacheName)`                     | Abre una caché (la crea si no existe).                             |
| `keys()`                              | Lista los nombres de las cachés.                                   |
| `put(cacheName, request, response)`   | Almacena una respuesta HTTP.                                       |
| `match(cacheName, request)`           | Recupera una respuesta o `undefined`.                              |
| `matchAll(cacheName, request?)`       | Recupera todas las respuestas o las que coincidan.                 |
| `remove(cacheName, request)`          | Elimina un recurso; retorna si existía.                            |
| `clear(cacheName)`                    | Vacía una caché sin eliminarla.                                    |
| `delete(cacheName)`                   | Elimina una caché completa.                                        |

## Errores

Todas las operaciones lanzan `StorageError` con un `code` que identifica el fallo:

```ts
import { StorageError } from '@josefo_pro/angular-storage-manager';

try {
  localStorageService.set('key', value);
} catch (error) {
  if (error instanceof StorageError && error.code === 'WRITE_FAILED') {
    // Manejar cuota agotada o acceso bloqueado.
  }
}
```

## Desarrollo

Este paquete se desarrolla dentro del workspace del repositorio:

```bash
npm install
npm run build:lib
npm test
```

## Licencia

MIT.
