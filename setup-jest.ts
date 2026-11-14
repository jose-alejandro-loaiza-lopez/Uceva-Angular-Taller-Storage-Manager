import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// jsdom no implementa la API `Response`, necesaria para crear respuestas HTTP
// en las pruebas del servicio de Cache Storage.
if (typeof globalThis.Response === 'undefined') {
  class ResponseStub {
    readonly body: string | null;
    readonly status: number;
    readonly ok: boolean;

    constructor(body?: string | null, init?: { status?: number }) {
      this.body = body ?? null;
      this.status = init?.status ?? 200;
      this.ok = this.status >= 200 && this.status <= 299;
    }
  }

  Object.defineProperty(globalThis, 'Response', {
    configurable: true,
    writable: true,
    value: ResponseStub,
  });
}
