# 🗄️ Storage Manager

Librería reutilizable en Angular para administrar el almacenamiento del navegador mediante **LocalStorage** y **Cache Storage**, con una API tipada, consistente y preparada para manejar errores.

Proyecto del curso **Arquitectura de Software** de la **Unidad Central del Valle del Cauca (UCEVA)**.

[![npm version](https://img.shields.io/npm/v/@josefo_pro/angular-storage-manager.svg)](https://www.npmjs.com/package/@josefo_pro/angular-storage-manager)

- 📦 Paquete: [`@josefo_pro/angular-storage-manager`](https://www.npmjs.com/package/@josefo_pro/angular-storage-manager)
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
| 7    | Publicación en NPM                 | ✅ Hecho (`0.1.0`) |
| 8    | Showcase consumiendo NPM           | ⏳ Pendiente |

> El workflow de publicación automática está activo en `main` y publica la librería en NPM cuando la versión aún no existe en el registro.

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
├── .github/workflows/                      # CI, release NPM y despliegue Pages
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
| `npm run version:patch` | Sube la versión patch de la librería (ej. `0.1.0` → `0.1.1`).     |
| `npm run version:minor` | Sube la versión minor de la librería (ej. `0.1.0` → `0.2.0`).     |
| `npm run version:major` | Sube la versión major de la librería (ej. `0.1.0` → `1.0.0`).     |

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

- **`main`**: rama de release. Cada push (merge desde `develop`) publica la librería en NPM si la versión es nueva y, después, despliega el Showcase en GitHub Pages.
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

Luego se abre un Pull Request hacia `develop`. Cuando la versión esté estable, se integra `develop` en `main` para publicar en NPM y desplegar el Showcase.

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
- `.github/workflows/release.yml`: se ejecuta en `main`. Publica la librería en NPM (solo si la versión es nueva) y, cuando termina, despliega el Showcase en GitHub Pages.

## 📦 Publicación automática en NPM

El flujo de release es:

1. En `develop`, sube la versión de la librería:

   ```bash
   npm run version:patch   # o version:minor / version:major
   git add projects/angular-storage-manager/package.json
   git commit -m "chore(release): v0.1.1"
   git push origin develop
   ```

2. Abre y mergea el Pull Request `develop → main`.
3. El workflow **Release**:
   - ejecuta las pruebas,
   - compila la librería,
   - verifica si `@josefo_pro/angular-storage-manager@X.Y.Z` ya existe en NPM,
   - si la versión es nueva, ejecuta `npm publish --access public`,
   - y al final despliega el Showcase en GitHub Pages.

Si la versión no cambió, la publicación se omite y el despliegue continúa.

### Configuración inicial (una sola vez)

1. Crea un **Granular Access Token** en NPM:
   - npmjs.com → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
   - Nombre: `github-actions-storage-manager`.
   - Expiración: la que prefieras (por ejemplo, 90 días).
   - **Packages and scopes:** selecciona el scope `@josefo_pro` con permiso **Read and write**.
   - Activa **Bypass 2FA** para que el workflow pueda publicar sin intervención manual.
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
   - Nombre: `NPM_TOKEN`
   - Valor: el token de NPM.
3. Verifica que el scope `@josefo_pro` exista en NPM y que tu cuenta tenga permisos para publicar.

> Debes configurar al menos uno de los dos métodos. Si no hay `NPM_TOKEN` ni Trusted Publishing, el job de publicación falla y el despliegue de Pages no se ejecuta.
>
> Nota: npm eliminó los tokens clásicos en noviembre de 2025; por eso se debe usar un token granular.

### Alternativa recomendada: Trusted Publishing (OIDC)

Cuando la librería ya exista en NPM, puedes eliminar el token y configurar **Trusted Publishing** en npmjs.com → tu paquete → **Settings → Trusted publishing**, usando:

- Organización o usuario: `jose-alejandro-loaiza-lopez`
- Repositorio: `Uceva-Angular-Taller-Storage-Manager`
- Workflow: `release.yml`

Con esa configuración, npm autentica el workflow mediante OIDC y ya no es necesario guardar un token de larga duración.

### Versión que consume el Showcase

Cuando el Showcase consuma el paquete desde NPM, la versión instalada se define en el `package.json` raíz. Si subes de `0.1.x` a `0.2.0`, actualiza también la dependencia:

```bash
npm install @josefo_pro/angular-storage-manager@^0.2.0
```

### GitHub Pages

El despliegue se habilita una sola vez en **Settings → Pages → Source: GitHub Actions**. La URL es:

```text
https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/
```

## ✅ Pendientes (pasos 5 a 8)

- [ ] **Paso 5:** pruebas unitarias de ambos servicios con cobertura del 100% (Jest ya está configurado).
- [ ] **Paso 6:** documentación con Compodoc y ampliación del README de la librería con ejemplos completos.
- [x] **Paso 7:** publicar la versión inicial en NPM (`@josefo_pro/angular-storage-manager@0.1.0`).
- [ ] **Paso 8:** implementar el Showcase consumiendo la librería **desde NPM**.

> Para el Paso 8 se debe instalar el paquete publicado y eliminar el alias de `tsconfig.json` que apunta a `dist/`, de modo que la app consuma realmente el paquete de NPM.

## 👥 Integrantes

- _(Completar con los nombres del grupo)_

## 📄 Licencia

MIT.
