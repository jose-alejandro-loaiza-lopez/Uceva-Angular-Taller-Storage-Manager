# 🗄️ Storage Manager

Librería reutilizable en Angular para administrar el almacenamiento del navegador mediante **LocalStorage** y **Cache Storage**, con una API tipada, consistente y preparada para manejar errores.

Proyecto del curso **Arquitectura de Software** de la **Unidad Central del Valle del Cauca (UCEVA)**.

- 📦 Paquete: `@josefo_pro/angular-storage-manager`
- 🧪 Framework: Angular 20 (standalone)
- 🚀 Showcase: aplicación Angular incluida en el workspace

## 📌 Estado del proyecto

| Paso | Actividad                          | Estado     |
| ---- | ---------------------------------- | ---------- |
| 1    | Creación y configuración           | ✅ Hecho   |
| 2    | Servicio LocalStorage              | ✅ Hecho   |
| 3    | Servicio Cache Storage             | ✅ Hecho   |
| 4    | Configuración de la API pública    | ✅ Hecho   |
| 5    | Pruebas unitarias (100% cobertura) | ⏳ Pendiente |
| 6    | Documentación técnica (Compodoc)   | ⏳ Pendiente |
| 7    | Publicación en NPM                 | ⏳ Pendiente |
| 8    | Showcase consumiendo NPM           | ⏳ Pendiente |

> Los pasos 5 a 8 están preparados para que otro integrante del grupo los implemente.

## 🧱 Estructura del workspace

```text
angular-storage-manager/
├── projects/angular-storage-manager/       # Librería publicable
│   └── src/
│       ├── public-api.ts                   # API pública (Paso 4)
│       └── lib/
│           ├── application/services/       # LocalStorageService y CacheStorageService
│           ├── core/
│           │   ├── errors/                 # StorageError
│           │   ├── interfaces/             # Contratos públicos
│           │   └── models/                 # Modelos públicos
│           └── infrastructure/tokens/      # Tokens internos (no se publican)
├── src/                                    # Aplicación Showcase (Angular)
│   └── app/presentation/pages/home/        # Página inicial de ejemplo
├── .github/workflows/                      # CI y despliegue en GitHub Pages
├── jest.config.js                          # Configuración de pruebas (Paso 5)
└── package.json
```

## 📋 Requisitos

- Node.js 20.19+, 22.12+ o 24+
- npm 10+
- Angular CLI 20 (opcional, los scripts usan la versión local)

```bash
node --version
npm --version
```

## 🚀 Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar la librería (la app la consume desde dist/)
npm run build:lib

# 3. Levantar la aplicación Showcase
npm start
```

La aplicación estará disponible en `http://localhost:4200/`.

> Mientras se implementa el Paso 8, la app muestra una página informativa con el estado del taller. Para consumir la librería desde la app, primero debe existir el build en `dist/angular-storage-manager` (`npm run build:lib`).

## 🛠️ Scripts disponibles

| Comando                 | Descripción                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| `npm start`             | Ejecuta la aplicación Showcase en modo desarrollo.                 |
| `npm run build`         | Compila la librería y luego la aplicación.                         |
| `npm run build:lib`     | Compila la librería en `dist/angular-storage-manager`.             |
| `npm run build:app`     | Compila la aplicación Showcase.                                    |
| `npm run build:dev`     | Compila la librería en modo watch.                                 |
| `npm test`              | Ejecuta las pruebas unitarias con Jest.                            |
| `npm run test:watch`    | Ejecuta Jest en modo watch.                                        |
| `npm run test:coverage` | Genera el reporte de cobertura.                                    |
| `npm run compodoc`      | Genera la documentación técnica con Compodoc.                      |

## 🔌 API pública

El archivo `projects/angular-storage-manager/src/public-api.ts` expone únicamente:

**Servicios**

- `LocalStorageService`: CRUD tipado con serialización JSON, validación de valores y errores con código.
- `CacheStorageService`: administración asíncrona de cachés, respuestas HTTP y recursos.

**Contratos y modelos**

- `LocalStorageServiceContract`
- `CacheStorageServiceContract`
- `CacheRequest`
- `StorageError` y `StorageErrorCode`

Ejemplo de consumo:

```ts
import { Component, inject } from '@angular/core';
import {
  CacheStorageService,
  LocalStorageService,
  StorageError,
} from '@josefo_pro/angular-storage-manager';

@Component({
  selector: 'app-example',
  template: `<button (click)="save()">Guardar</button>`,
})
export class ExampleComponent {
  private readonly localStorage = inject(LocalStorageService);
  private readonly cacheStorage = inject(CacheStorageService);

  save(): void {
    try {
      this.localStorage.set('profile', { name: 'Ana', active: true });
    } catch (error) {
      if (error instanceof StorageError) {
        console.error(error.code, error.message);
      }
    }
  }

  async cache(): Promise<void> {
    await this.cacheStorage.put(
      'app-v1',
      'https://example.com/data.json',
      await fetch('https://example.com/data.json'),
    );
    const response = await this.cacheStorage.match('app-v1', 'https://example.com/data.json');
    console.log(await response?.json());
  }
}
```

Los tokens de inyección y los detalles internos **no** forman parte de la API pública.

## 🌿 Estrategia de ramas

- **`main`**: rama de producción. Cada push dispara el despliegue en GitHub Pages.
- **`develop`**: rama de desarrollo y rama por defecto del repositorio. Aquí se integran las funcionalidades.

Flujo recomendado:

```bash
# Crear una rama de trabajo desde develop
git checkout develop
git pull origin develop
git checkout -b feat/mi-funcionalidad

# ... cambios ...

git add .
git commit -m "feat: agrega mi funcionalidad"
git push -u origin feat/mi-funcionalidad
```

Luego se abre un Pull Request hacia `develop`. Cuando la versión esté estable, se integra `develop` en `main` para desplegar.

### Conventional Commits

El repositorio usa [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: nueva funcionalidad
fix: corrección de un error
docs: cambios en documentación
test: pruebas unitarias
refactor: reestructuración sin cambiar comportamiento
chore: tareas de mantenimiento o configuración
ci: cambios en integración continua
```

## ⚙️ CI/CD

- `.github/workflows/ci.yml`: compila la librería y la app, y ejecuta las pruebas en `develop` y Pull Requests.
- `.github/workflows/deploy-github-pages.yml`: compila y publica el Showcase en GitHub Pages desde `main`.

Para habilitar el despliegue:

1. Ve a **Settings → Pages**.
2. En **Source**, selecciona **GitHub Actions**.
3. Haz push a `main` o ejecuta el workflow manualmente desde **Actions**.

URL esperada:

```text
https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/
```

## ✅ Pendientes (pasos 5 a 8)

- [ ] **Paso 5:** pruebas unitarias de ambos servicios con cobertura del 100% (Jest ya está configurado).
- [ ] **Paso 6:** documentación con Compodoc y ampliación del README de la librería con ejemplos completos.
- [ ] **Paso 7:** compilar la librería y publicarla en NPM con `npm publish --access public`.
- [ ] **Paso 8:** implementar el Showcase consumiendo la librería **desde NPM**.

> Para el Paso 8 se debe instalar el paquete publicado y eliminar el alias de `tsconfig.json` que apunta a `dist/`, de modo que la app consuma realmente el paquete de NPM.

## 👥 Integrantes

- _(Completar con los nombres del grupo)_

## 📄 Licencia

MIT.
