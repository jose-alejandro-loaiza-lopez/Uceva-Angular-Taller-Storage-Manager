# 🗄️ Storage Manager

Librería reutilizable en Angular para administrar el almacenamiento del navegador mediante **LocalStorage** y **Cache Storage**, con una API tipada, consistente y preparada para manejar errores.

Proyecto del curso **Arquitectura de Software** de la **Unidad Central del Valle del Cauca (UCEVA)**.

[![npm version](https://img.shields.io/npm/v/@josefo_pro/angular-storage-manager.svg)](https://www.npmjs.com/package/@josefo_pro/angular-storage-manager)

- 📦 Paquete: [`@josefo_pro/angular-storage-manager`](https://www.npmjs.com/package/@josefo_pro/angular-storage-manager) (`0.1.0`)
- 🧪 Framework: Angular 20 (standalone)
- 🚀 Showcase: <https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/>
- 📚 Documentación técnica: <https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/documentation/>

## 📌 Estado del proyecto

| Paso | Actividad                          | Estado                                                       |
| ---- | ---------------------------------- | ------------------------------------------------------------ |
| 1    | Creación y configuración           | ✅ Hecho                                                     |
| 2    | Servicio LocalStorage              | ✅ Hecho                                                     |
| 3    | Servicio Cache Storage             | ✅ Hecho                                                     |
| 4    | Configuración de la API pública    | ✅ Hecho                                                     |
| 5    | Pruebas unitarias (100% cobertura) | ✅ Hecho (84 pruebas)                                        |
| 6    | Documentación técnica (Compodoc)   | ✅ Hecho                                                     |
| 7    | Publicación en NPM                 | ✅ Hecho (`0.1.0`)                                           |
| 8    | Showcase consumiendo NPM           | ✅ Hecho                                                     |

> El workflow de publicación automática está activo en `main`: publica la librería en NPM cuando la versión aún no existe y despliega el Showcase y la documentación en GitHub Pages.

## 🧱 Estructura del workspace

```text
angular-storage-manager/
├── projects/angular-storage-manager/       # Librería publicable
│   ├── README.md                           # Documentación del paquete
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
│   └── app/presentation/pages/
│       ├── home/                           # Portada y estado del taller
│       ├── local-storage-demo/             # Demostración de LocalStorage
│       └── cache-storage-demo/             # Demostración de Cache Storage
├── .github/workflows/                      # CI, release NPM y despliegue Pages
├── jest.config.js                          # Configuración de pruebas (Paso 5)
├── tsconfig.doc.json                       # Configuración de Compodoc (Paso 6)
└── package.json
```

## 📋 Requisitos

- Node.js 20.19+, 22.12+ o 24+
- npm 10+
- Angular CLI 20 (opcional, los scripts usan la versión local)
- Navegador con soporte de `Cache Storage` (contexto seguro: HTTPS o `localhost`)

```bash
node --version
npm --version
```

## 🚀 Puesta en marcha

```bash
# 1. Instalar dependencias (incluye la librería publicada desde NPM)
npm install

# 2. Levantar la aplicación Showcase
npm start
```

La aplicación estará disponible en `http://localhost:4200/`.

El Showcase importa `@josefo_pro/angular-storage-manager` directamente desde `node_modules`; **no** utiliza alias hacia `dist/`. La dependencia está declarada en el `package.json` raíz:

```json
"@josefo_pro/angular-storage-manager": "^0.1.0"
```

Para compilar la librería de forma local (por ejemplo, mientras se desarrolla una nueva versión) o generar el build completo:

```bash
npm run build:lib   # genera dist/angular-storage-manager
npm run build       # librería + aplicación Showcase
```

## 🛠️ Scripts disponibles

| Comando                 | Descripción                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm start`             | Ejecuta la aplicación Showcase en modo desarrollo.                      |
| `npm run build`         | Compila la librería y luego la aplicación.                              |
| `npm run build:lib`     | Compila la librería en `dist/angular-storage-manager`.                  |
| `npm run build:app`     | Compila la aplicación Showcase.                                         |
| `npm run build:dev`     | Compila la librería en modo watch.                                      |
| `npm test`              | Ejecuta las pruebas unitarias con Jest y valida la cobertura.           |
| `npm run test:watch`    | Ejecuta Jest en modo watch.                                             |
| `npm run test:coverage` | Genera el reporte de cobertura en `coverage/`.                          |
| `npm run compodoc`      | Genera la documentación técnica en `documentation/`.                    |
| `npm run version:patch` | Sube la versión patch de la librería (ej. `0.1.0` → `0.1.1`).          |
| `npm run version:minor` | Sube la versión minor de la librería (ej. `0.1.0` → `0.2.0`).          |
| `npm run version:major` | Sube la versión major de la librería (ej. `0.1.0` → `1.0.0`).          |

## 🧪 Pruebas unitarias

Las pruebas cubren ambos servicios, los tokens internos y el modelo de errores. La configuración de Jest exige **100% de cobertura** en statements, branches, functions y lines, por lo que el comando falla si la cobertura baja.

```bash
npm test                # ejecuta las 84 pruebas y valida el umbral
npm run test:coverage   # genera el reporte HTML en coverage/
```

Escenarios cubiertos:

- Operaciones exitosas de `LocalStorageService` (`set`, `get`, `has`, `update`, `remove`, `clear`, `keys`).
- Valores primitivos, objetos, `null`, `undefined` y contenido no serializable.
- Errores del navegador (`QuotaExceededError`, `SecurityError`), JSON inválido y entorno sin `LocalStorage`.
- Operaciones exitosas y errores de `CacheStorageService` (cachés inexistentes, recursos ausentes, fallos nativos).
- Entornos sin `Cache Storage` y preservación de errores `StorageError`.
- Resolución segura de los tokens internos cuando el navegador no está disponible o bloquea el acceso.

## 📚 Documentación técnica

La documentación de servicios, métodos, parámetros, interfaces y modelos se genera con **Compodoc**:

```bash
npm run compodoc
```

El resultado se escribe en `documentation/` y el workflow de release lo publica junto al Showcase en GitHub Pages:

<https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/documentation/>

La documentación de uso, instalación y ejemplos de la librería está en [`projects/angular-storage-manager/README.md`](projects/angular-storage-manager/README.md).

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

- **`main`**: rama estable y **rama por defecto del repositorio**. Cada push (merge desde `develop`) publica la librería en NPM si la versión es nueva y, después, despliega el Showcase y la documentación en GitHub Pages.
- **`develop`**: rama de desarrollo. Aquí se integran las funcionalidades antes de pasar a `main`.

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

- `.github/workflows/ci.yml`: compila la librería y la app, genera la documentación con Compodoc y ejecuta las pruebas en `develop` y Pull Requests.
- `.github/workflows/release.yml`: se ejecuta en `main`. Publica la librería en NPM (solo si la versión es nueva) y, cuando termina, despliega el Showcase y la documentación en GitHub Pages.

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
   - y al final despliega el Showcase y la documentación en GitHub Pages.

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

La versión instalada se define en el `package.json` raíz. Si subes de `0.1.x` a `0.2.0`, actualiza también la dependencia:

```bash
npm install @josefo_pro/angular-storage-manager@^0.2.0
```

### GitHub Pages

El despliegue se habilita una sola vez en **Settings → Pages → Source: GitHub Actions**. La URL es:

```text
https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/
```

La documentación de Compodoc se publica en:

```text
https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/documentation/
```

## 👥 Integrantes

- Angel Julian Cuero Jimenez
- Jose Alejandro Loaiza Lopez

## 📄 Licencia

MIT.
