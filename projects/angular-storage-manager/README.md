# @josefo_pro/angular-storage-manager

Librería Angular para gestionar **LocalStorage** y **Cache Storage** con una API tipada, consistente y preparada para manejar errores.

[![npm version](https://img.shields.io/npm/v/@josefo_pro/angular-storage-manager.svg)](https://www.npmjs.com/package/@josefo_pro/angular-storage-manager)
[![license](https://img.shields.io/npm/l/@josefo_pro/angular-storage-manager.svg)](https://github.com/jose-alejandro-loaiza-lopez/Uceva-Angular-Taller-Storage-Manager/blob/main/LICENSE)

- **Angular**: 20 (standalone)
- **Cobertura de pruebas**: 100% en statements, branches, functions y lines
- **Documentación técnica (Compodoc)**: <https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/documentation/>
- **Showcase**: <https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/>

## Características

- `LocalStorageService`: operaciones de almacenamiento, consulta, actualización, verificación y eliminación sobre `LocalStorage`.
- `CacheStorageService`: creación y administración de cachés, almacenamiento y consulta de respuestas HTTP, eliminación de recursos y de cachés completas.
- Serialización JSON automática para admitir primitivos y objetos.
- Manejo consistente de errores mediante `StorageError` y códigos tipados.
- Servicios `providedIn: 'root'`: no requieren módulos ni configuración adicional.
- API pública controlada: solo se exportan servicios, contratos, modelos y errores.
- Compatible con renderizado del lado del servidor (SSR): los tokens internos resuelven `null` cuando el navegador no está disponible.

## Requisitos

- Angular `^20.3.0` (`@angular/core` y `@angular/common`)
- Un navegador con soporte de `LocalStorage`
- Un navegador con soporte de **Cache Storage** para las operaciones de caché
- Contexto seguro (**HTTPS** o `localhost`) para usar `Cache Storage`

## Instalación

```bash
npm install @josefo_pro/angular-storage-manager
```

## Configuración

No se requiere configuración adicional. Ambos servicios usan `providedIn: 'root'`, por lo que Angular los resuelve automáticamente al inyectarlos:

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

    await this.cacheStorage.put('app-v1', 'https://example.com/data.json', new Response('{"ok":true}'));
  }
}
```

## LocalStorageService

Administra valores del `LocalStorage` del origen actual. Los valores se serializan con `JSON.stringify` al guardarlos y se deserializan con `JSON.parse` al leerlos.

| Método                  | Descripción                                                       | Retorno                |
| ----------------------- | ----------------------------------------------------------------- | ---------------------- |
| `set<T>(key, value)`    | Guarda o sobrescribe un valor.                                    | `void`                 |
| `get<T>(key)`           | Recupera el valor deserializado.                                  | `T \| null`            |
| `has(key)`              | Comprueba si la clave existe.                                     | `boolean`              |
| `update<T>(key, value)` | Actualiza una clave existente.                                    | `boolean`              |
| `remove(key)`           | Elimina una clave.                                                | `boolean`              |
| `clear()`               | Elimina todas las claves del origen actual.                       | `void`                 |
| `keys()`                | Lista las claves existentes.                                      | `string[]`             |

### Guardar y consultar valores

```ts
import { inject } from '@angular/core';
import { LocalStorageService } from '@josefo_pro/angular-storage-manager';

const storage = inject(LocalStorageService);

// Objetos
storage.set('profile', { name: 'Ana', active: true });

// Primitivos
storage.set('counter', 42);
storage.set('enabled', true);
storage.set('label', 'demo');

// Consulta tipada
const profile = storage.get<{ name: string; active: boolean }>('profile'); // { name: 'Ana', active: true }
const counter = storage.get<number>('counter'); // 42
const missing = storage.get('missing'); // null
```

### Verificar, actualizar y eliminar

```ts
storage.has('profile'); // true

storage.update('profile', { name: 'Ana', active: false }); // true
storage.update('missing', 'value'); // false (no existe)

storage.remove('profile'); // true
storage.remove('profile'); // false (ya no existe)

storage.keys(); // ['counter', 'enabled', 'label']
storage.clear(); // vacía todo el LocalStorage del origen
```

### Notas de serialización

- Se admiten objetos, arreglos, strings, números, booleanos y `null`.
- `undefined` no se puede serializar y lanza `SERIALIZATION_FAILED`.
- Las funciones y los símbolos no se pueden representar en JSON y lanzan `SERIALIZATION_FAILED`.
- Los objetos circulares o valores como `BigInt` lanzan `SERIALIZATION_FAILED` con la causa original.
- Si el contenido almacenado no es JSON válido, `get()` lanza `DESERIALIZATION_FAILED`.

## CacheStorageService

Administra recursos del origen actual mediante la API `Cache Storage`. Todas las operaciones son asíncronas.

| Método                                | Descripción                                                        | Retorno                     |
| ------------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| `isSupported()`                       | Indica si `CacheStorage` está disponible.                          | `boolean`                   |
| `has(cacheName)`                      | Comprueba si una caché existe.                                     | `Promise<boolean>`          |
| `create(cacheName)`                   | Crea una caché si no existe.                                       | `Promise<boolean>`          |
| `open(cacheName)`                     | Abre una caché (la crea si no existe).                             | `Promise<Cache>`            |
| `keys()`                              | Lista los nombres de las cachés.                                   | `Promise<string[]>`         |
| `put(cacheName, request, response)`   | Almacena una respuesta HTTP.                                       | `Promise<void>`             |
| `match(cacheName, request)`           | Recupera una respuesta o `undefined`.                              | `Promise<Response \| undefined>` |
| `matchAll(cacheName, request?)`       | Recupera todas las respuestas o las que coincidan con un recurso.  | `Promise<readonly Response[]>` |
| `remove(cacheName, request)`          | Elimina un recurso de una caché.                                   | `Promise<boolean>`          |
| `clear(cacheName)`                    | Vacía una caché sin eliminarla.                                    | `Promise<boolean>`          |
| `delete(cacheName)`                   | Elimina una caché completa con todos sus recursos.                 | `Promise<boolean>`          |

`CacheRequest` es un alias público de `string | Request`; puedes usar una URL absoluta o un objeto `Request`.

### Crear y administrar cachés

```ts
import { inject } from '@angular/core';
import { CacheStorageService } from '@josefo_pro/angular-storage-manager';

const cacheStorage = inject(CacheStorageService);

if (cacheStorage.isSupported()) {
  await cacheStorage.create('app-v1'); // true (o false si ya existía)
  await cacheStorage.has('app-v1'); // true

  const cache = await cacheStorage.open('app-v1'); // instancia nativa Cache
  const requests = await cache.keys(); // recursos almacenados

  await cacheStorage.keys(); // ['app-v1']
  await cacheStorage.delete('app-v1'); // true
}
```

### Almacenar y consultar respuestas HTTP

```ts
const url = 'https://example.com/data.json';

// 1. Obtener la respuesta (la petición la realiza tu aplicación)
const response = await fetch(url);

// 2. Almacenarla en la caché
await cacheStorage.put('app-v1', url, response);

// 3. Recuperarla
const cached = await cacheStorage.match('app-v1', url);
console.log(cached?.status); // 200
console.log(await cached?.json());

// 4. Consultar todas las respuestas de la caché
const all = await cacheStorage.matchAll('app-v1');

// 5. Eliminar un recurso
await cacheStorage.remove('app-v1', url);

// 6. Vaciar la caché sin eliminarla
await cacheStorage.clear('app-v1');

// 7. Eliminar la caché completa
await cacheStorage.delete('app-v1');
```

> `put()` crea la caché automáticamente si no existe. `match()`, `matchAll()` y `remove()` devuelven `undefined`, un arreglo vacío o `false` cuando la caché o el recurso no existen.
>
> `Cache Storage` requiere un contexto seguro (HTTPS o `localhost`). En entornos sin la API, `isSupported()` devuelve `false` y las operaciones lanzan `CACHE_UNAVAILABLE`.

## Manejo de errores

Todas las operaciones pueden lanzar `StorageError`, que conserva el error nativo en `cause` y expone un `code` estable:

```ts
import { StorageError } from '@josefo_pro/angular-storage-manager';

try {
  localStorageService.set('key', value);
} catch (error) {
  if (error instanceof StorageError) {
    console.error(error.code, error.message, error.cause);
  }
}
```

### Códigos de error

| Código                   | Significado                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `STORAGE_UNAVAILABLE`    | `LocalStorage` no está disponible en el entorno.                   |
| `SERIALIZATION_FAILED`   | El valor no se puede serializar a JSON.                            |
| `DESERIALIZATION_FAILED` | El contenido almacenado no es JSON válido.                         |
| `WRITE_FAILED`           | Falló la escritura (por ejemplo, cuota agotada o acceso bloqueado). |
| `READ_FAILED`            | Falló la lectura o la consulta de claves.                          |
| `REMOVE_FAILED`          | Falló la eliminación de una clave.                                 |
| `CLEAR_FAILED`           | Falló el vaciado del almacenamiento.                               |
| `CACHE_UNAVAILABLE`      | `Cache Storage` no está disponible en el entorno.                  |
| `CACHE_OPEN_FAILED`      | No se pudo abrir o crear una caché.                                |
| `CACHE_WRITE_FAILED`     | No se pudo almacenar un recurso.                                   |
| `CACHE_READ_FAILED`      | No se pudo consultar una caché o un recurso.                       |
| `CACHE_DELETE_FAILED`    | No se pudo eliminar un recurso o una caché.                        |

## Uso en SSR

Los tokens internos detectan si `localStorage` y `caches` existen. En SSR o en entornos sin navegador, los servicios están disponibles pero lanzan:

- `STORAGE_UNAVAILABLE` al operar con `LocalStorageService`.
- `CACHE_UNAVAILABLE` al operar con `CacheStorageService`.

Puedes comprobar el entorno antes de operar:

```ts
if (cacheStorage.isSupported()) {
  await cacheStorage.put('app-v1', url, response);
}
```

## Ejemplo completo en un componente

```ts
import { Component, inject, signal } from '@angular/core';
import { LocalStorageService, StorageError } from '@josefo_pro/angular-storage-manager';

@Component({
  selector: 'app-profile',
  template: `
    <button (click)="save()">Guardar</button>
    <button (click)="load()">Cargar</button>
    <pre>{{ profile() | json }}</pre>
  `,
})
export class ProfileComponent {
  private readonly storage = inject(LocalStorageService);

  readonly profile = signal<{ name: string; active: boolean } | null>(null);

  save(): void {
    try {
      this.storage.set('profile', { name: 'Ana', active: true });
    } catch (error) {
      if (error instanceof StorageError) {
        console.error(error.code, error.message);
      }
    }
  }

  load(): void {
    this.profile.set(this.storage.get<{ name: string; active: boolean }>('profile'));
  }
}
```

## Pruebas y documentación

El repositorio incluye pruebas unitarias con Jest y documentación generada con Compodoc:

```bash
npm test                # 84 pruebas, cobertura del 100%
npm run test:coverage   # reporte HTML en coverage/
npm run compodoc        # documentación en documentation/
```

Repositorio: <https://github.com/jose-alejandro-loaiza-lopez/Uceva-Angular-Taller-Storage-Manager>

Documentación generada: <https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/documentation/>

## Licencia

MIT.
