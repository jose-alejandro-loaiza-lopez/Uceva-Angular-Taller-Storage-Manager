import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CacheStorageService, StorageError } from '@josefo_pro/angular-storage-manager';

interface CachedResource {
  readonly url: string;
  readonly status: number;
  readonly contentType: string;
  readonly body: string;
}

interface LogEntry {
  readonly id: number;
  readonly level: 'success' | 'info' | 'error';
  readonly title: string;
  readonly detail?: string;
  readonly time: string;
}

@Component({
  selector: 'app-cache-storage-demo',
  imports: [FormsModule],
  templateUrl: './cache-storage-demo.html',
  styleUrl: './cache-storage-demo.scss',
})
export class CacheStorageDemo {
  private readonly storageApi = inject(CacheStorageService);
  private nextLogId = 0;

  protected readonly supported = signal(this.storageApi.isSupported());
  protected readonly busy = signal(false);
  protected readonly caches = signal<readonly string[]>([]);
  protected readonly selectedCache = signal('');
  protected readonly cacheNameInput = signal('showcase-v1');
  protected readonly resources = signal<readonly CachedResource[]>([]);
  protected readonly matchResult = signal<CachedResource | null>(null);
  protected readonly log = signal<readonly LogEntry[]>([]);

  protected readonly resourceUrl = signal('https://jsonplaceholder.typicode.com/posts/1');
  protected readonly resourceBody = signal('{\n  "title": "Recurso de ejemplo",\n  "cached": true\n}');
  protected readonly resourceStatus = signal(200);
  protected readonly resourceType = signal('application/json');

  constructor() {
    if (!this.supported()) {
      this.pushLog(
        'error',
        'Entorno no compatible',
        'Cache Storage requiere un contexto seguro (HTTPS o localhost).',
      );
      return;
    }

    this.pushLog(
      'info',
      'Servicio listo',
      'CacheStorageService se inyectó desde @josefo_pro/angular-storage-manager.',
    );
    void this.refreshAll();
  }

  protected async refreshAll(): Promise<void> {
    await this.execute('keys()', async () => {
      await this.loadCaches();
      await this.refreshResources();

      return `${this.caches().length} caché(s) encontrada(s) en el origen.`;
    });
  }

  protected async createCache(): Promise<void> {
    const name = this.currentCacheName();

    if (name === null) {
      return;
    }

    await this.execute('create()', async () => {
      const created = await this.storageApi.create(name);
      this.selectedCache.set(name);
      await this.loadCaches();
      await this.refreshResources();

      return created ? `Caché "${name}" creada.` : `La caché "${name}" ya existía.`;
    });
  }

  protected async openCache(): Promise<void> {
    const name = this.currentCacheName();

    if (name === null) {
      return;
    }

    await this.execute('open()', async () => {
      const cache = await this.storageApi.open(name);
      const requests = await cache.keys();
      this.selectedCache.set(name);
      await this.loadCaches();
      await this.refreshResources();

      return `Caché "${name}" abierta con ${requests.length} recurso(s).`;
    });
  }

  protected async selectCache(name: string): Promise<void> {
    this.selectedCache.set(name);
    this.busy.set(true);

    try {
      await this.refreshResources();
    } catch (error) {
      this.handleError('matchAll()', error);
    } finally {
      this.busy.set(false);
    }
  }

  protected async deleteCache(): Promise<void> {
    const name = this.currentSelectedCache();

    if (name === null) {
      return;
    }

    const confirmed = globalThis.confirm(`Se eliminará la caché "${name}" con todos sus recursos.`);

    if (!confirmed) {
      return;
    }

    await this.execute('delete()', async () => {
      const deleted = await this.storageApi.delete(name);
      this.selectedCache.set('');
      this.matchResult.set(null);
      this.resources.set([]);
      await this.loadCaches();
      await this.refreshResources();

      return deleted ? `Caché "${name}" eliminada.` : `La caché "${name}" no existía.`;
    });
  }

  protected async clearCache(): Promise<void> {
    const name = this.currentSelectedCache();

    if (name === null) {
      return;
    }

    const confirmed = globalThis.confirm(
      `Se eliminarán todos los recursos de la caché "${name}" sin borrar la caché.`,
    );

    if (!confirmed) {
      return;
    }

    await this.execute('clear()', async () => {
      const cleared = await this.storageApi.clear(name);
      this.matchResult.set(null);
      await this.refreshResources();

      return cleared ? `Caché "${name}" vaciada.` : `La caché "${name}" no existía.`;
    });
  }

  protected async saveResource(): Promise<void> {
    const name = this.currentSelectedCache();
    const url = this.resourceUrl().trim();

    if (name === null) {
      return;
    }

    if (url.length === 0) {
      this.pushLog('error', 'Validación', 'La URL del recurso es obligatoria.');
      return;
    }

    const status = Number(this.resourceStatus());

    if (!Number.isInteger(status) || status < 200 || status > 599) {
      this.pushLog('error', 'Validación', 'El código de estado debe estar entre 200 y 599.');
      return;
    }

    const body = this.resourceBody();

    if (body.length > 0 && (status === 204 || status === 205 || status === 304)) {
      this.pushLog('error', 'Validación', `El estado ${status} no admite cuerpo en la respuesta.`);
      return;
    }

    await this.execute('put()', async () => {
      const headers = new Headers();

      if (this.resourceType().trim().length > 0) {
        headers.set('content-type', this.resourceType().trim());
      }

      await this.storageApi.put(
        name,
        url,
        new Response(body.length > 0 ? body : null, { status, headers }),
      );
      await this.refreshResources();

      return `Recurso almacenado en "${name}" con estado ${status}.`;
    });
  }

  protected async matchResourceFrom(url: string): Promise<void> {
    this.resourceUrl.set(url);
    await this.matchResource();
  }

  protected async matchResource(): Promise<void> {
    const name = this.currentSelectedCache();
    const url = this.currentUrl();

    if (name === null || url === null) {
      return;
    }

    await this.execute('match()', async () => {
      const response = await this.storageApi.match(name, url);

      if (response === undefined) {
        this.matchResult.set(null);
        return `El recurso "${url}" no está en la caché "${name}".`;
      }

      const body = await response.clone().text();
      const resource = this.toCachedResource(url, response, body);
      this.matchResult.set(resource);

      return `Recurso recuperado: ${response.status} ${response.statusText || 'OK'}.`;
    });
  }

  protected async matchAllResources(): Promise<void> {
    const name = this.currentSelectedCache();

    if (name === null) {
      return;
    }

    await this.execute('matchAll()', async () => {
      const responses = await this.storageApi.matchAll(name);

      return `matchAll() devolvió ${responses.length} respuesta(s) de "${name}".`;
    });
  }

  protected async removeCurrentResource(): Promise<void> {
    const url = this.currentUrl();

    if (url !== null) {
      await this.removeResource(url);
    }
  }

  protected async removeResource(url: string): Promise<void> {
    const name = this.currentSelectedCache();

    if (name === null) {
      return;
    }

    await this.execute('remove()', async () => {
      const removed = await this.storageApi.remove(name, url);
      this.matchResult.set(null);
      await this.refreshResources();

      return removed
        ? `Recurso "${url}" eliminado de "${name}".`
        : `El recurso "${url}" no existía en "${name}".`;
    });
  }

  protected async refresh(): Promise<void> {
    await this.selectCache(this.selectedCache());
  }

  private async loadCaches(): Promise<void> {
    const names = await this.storageApi.keys();
    this.caches.set(names);

    if (!names.includes(this.selectedCache())) {
      this.selectedCache.set(names[0] ?? '');
    }
  }

  private async refreshResources(): Promise<void> {
    const name = this.selectedCache();
    this.matchResult.set(null);

    if (name.length === 0) {
      this.resources.set([]);
      return;
    }

    const exists = await this.storageApi.has(name);

    if (!exists) {
      this.resources.set([]);
      return;
    }

    const cache = await this.storageApi.open(name);
    const requests = await cache.keys();
    const resources: CachedResource[] = [];

    for (const request of requests) {
      const response = await cache.match(request);

      if (response === undefined) {
        continue;
      }

      const body = await response.clone().text();
      resources.push(this.toCachedResource(request.url, response, body));
    }

    this.resources.set(resources);
  }

  private toCachedResource(url: string, response: Response, body: string): CachedResource {
    return {
      url,
      status: response.status,
      contentType: response.headers.get('content-type') ?? 'sin content-type',
      body: body.length > 400 ? `${body.slice(0, 400)}…` : body,
    };
  }

  private currentCacheName(): string | null {
    const name = this.cacheNameInput().trim();

    if (name.length === 0) {
      this.pushLog('error', 'Validación', 'El nombre de la caché es obligatorio.');
      return null;
    }

    return name;
  }

  private currentSelectedCache(): string | null {
    const name = this.selectedCache();

    if (name.length === 0) {
      this.pushLog('error', 'Validación', 'Primero crea o selecciona una caché.');
      return null;
    }

    return name;
  }

  private currentUrl(): string | null {
    const url = this.resourceUrl().trim();

    if (url.length === 0) {
      this.pushLog('error', 'Validación', 'La URL del recurso es obligatoria.');
      return null;
    }

    return url;
  }

  private async execute(title: string, action: () => Promise<string>): Promise<void> {
    if (!this.supported()) {
      this.pushLog('error', title, 'Cache Storage no está disponible en este entorno.');
      return;
    }

    this.busy.set(true);

    try {
      const detail = await action();
      this.pushLog('success', title, detail);
    } catch (error) {
      this.handleError(title, error);
    } finally {
      this.busy.set(false);
    }
  }

  private handleError(operation: string, error: unknown): void {
    if (error instanceof StorageError) {
      this.pushLog('error', operation, `${error.message} [código: ${error.code}]`);
      return;
    }

    const detail = error instanceof Error ? error.message : String(error);
    this.pushLog('error', operation, detail);
  }

  private pushLog(level: LogEntry['level'], title: string, detail?: string): void {
    this.nextLogId += 1;
    const entry: LogEntry = {
      id: this.nextLogId,
      level,
      title,
      detail,
      time: new Date().toLocaleTimeString(),
    };

    this.log.update((entries) => [entry, ...entries].slice(0, 8));
  }
}
