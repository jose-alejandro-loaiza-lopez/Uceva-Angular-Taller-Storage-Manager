import { TestBed } from '@angular/core/testing';
import { StorageError } from '../../core/errors/storage.error';
import { CACHE_STORAGE } from '../../infrastructure/tokens/cache-storage.token';
import { CacheStorageService } from './cache-storage.service';

interface CacheMock {
  add: jest.Mock;
  addAll: jest.Mock;
  delete: jest.Mock;
  keys: jest.Mock;
  match: jest.Mock;
  matchAll: jest.Mock;
  put: jest.Mock;
}

function createCacheMock(): CacheMock {
  return {
    add: jest.fn(),
    addAll: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn(),
    match: jest.fn(),
    matchAll: jest.fn(),
    put: jest.fn(),
  };
}

function createCacheStorageMock(): jest.Mocked<CacheStorage> {
  return {
    delete: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    match: jest.fn(),
    open: jest.fn(),
  } as unknown as jest.Mocked<CacheStorage>;
}

function createService(cacheStorage: CacheStorage | null = createCacheStorageMock()): {
  service: CacheStorageService;
  cacheStorage: jest.Mocked<CacheStorage>;
  cache: CacheMock;
} {
  const cache = createCacheMock();
  const cacheStorageMock = cacheStorage as jest.Mocked<CacheStorage>;

  if (cacheStorage !== null) {
    cacheStorageMock.open.mockResolvedValue(cache as unknown as Cache);
  }

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: CACHE_STORAGE, useValue: cacheStorage }],
  });

  return {
    service: TestBed.inject(CacheStorageService),
    cacheStorage: cacheStorageMock,
    cache,
  };
}

describe('CacheStorageService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('isSupported()', () => {
    it('devuelve true cuando Cache Storage está disponible', () => {
      const { service } = createService();

      expect(service.isSupported()).toBe(true);
    });

    it('devuelve false cuando Cache Storage no está disponible', () => {
      const { service } = createService(null);

      expect(service.isSupported()).toBe(false);
    });
  });

  describe('has()', () => {
    it('devuelve true cuando la caché existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(true);

      await expect(service.has('app-v1')).resolves.toBe(true);
      expect(cacheStorage.has).toHaveBeenCalledWith('app-v1');
    });

    it('devuelve false cuando la caché no existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);

      await expect(service.has('app-v1')).resolves.toBe(false);
    });

    it('envuelve los errores al consultar la caché', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockRejectedValue(new Error('native'));

      await expect(service.has('app-v1')).rejects.toMatchObject({
        code: 'CACHE_READ_FAILED',
      });
    });

    it('propaga los StorageError nativos sin envolverlos', async () => {
      const { service, cacheStorage } = createService();
      const storageError = new StorageError('CACHE_READ_FAILED', 'personalizado');
      cacheStorage.has.mockRejectedValue(storageError);

      await expect(service.has('app-v1')).rejects.toBe(storageError);
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.has('app-v1')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('create()', () => {
    it('crea una caché nueva y devuelve true', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);

      await expect(service.create('app-v1')).resolves.toBe(true);
      expect(cacheStorage.open).toHaveBeenCalledWith('app-v1');
    });

    it('devuelve false cuando la caché ya existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(true);

      await expect(service.create('app-v1')).resolves.toBe(false);
      expect(cacheStorage.open).not.toHaveBeenCalled();
    });

    it('envuelve los errores al crear la caché', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);
      cacheStorage.open.mockRejectedValue(new Error('native'));

      await expect(service.create('app-v1')).rejects.toMatchObject({
        code: 'CACHE_OPEN_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.create('app-v1')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('open()', () => {
    it('abre una caché existente', async () => {
      const { service, cache } = createService();

      await expect(service.open('app-v1')).resolves.toBe(cache);
    });

    it('envuelve los errores al abrir la caché', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.open.mockRejectedValue(new Error('native'));

      await expect(service.open('app-v1')).rejects.toMatchObject({
        code: 'CACHE_OPEN_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.open('app-v1')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('keys()', () => {
    it('devuelve los nombres de las cachés', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.keys.mockResolvedValue(['app-v1', 'images']);

      await expect(service.keys()).resolves.toEqual(['app-v1', 'images']);
    });

    it('envuelve los errores al listar las cachés', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.keys.mockRejectedValue(new Error('native'));

      await expect(service.keys()).rejects.toMatchObject({
        code: 'CACHE_READ_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.keys()).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('put()', () => {
    it('almacena una respuesta en la caché', async () => {
      const { service, cacheStorage, cache } = createService();
      const response = new Response('{"ok":true}');

      await expect(service.put('app-v1', 'https://example.com/data.json', response)).resolves.toBeUndefined();

      expect(cacheStorage.open).toHaveBeenCalledWith('app-v1');
      expect(cache.put).toHaveBeenCalledWith('https://example.com/data.json', response);
    });

    it('envuelve los errores al abrir la caché durante la escritura', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.open.mockRejectedValue(new Error('native'));

      await expect(
        service.put('app-v1', 'https://example.com/data.json', new Response('{}')),
      ).rejects.toMatchObject({ code: 'CACHE_WRITE_FAILED' });
    });

    it('envuelve los errores al almacenar la respuesta', async () => {
      const { service, cache } = createService();
      cache.put.mockRejectedValue(new Error('native'));

      await expect(
        service.put('app-v1', 'https://example.com/data.json', new Response('{}')),
      ).rejects.toMatchObject({ code: 'CACHE_WRITE_FAILED' });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(
        service.put('app-v1', 'https://example.com/data.json', new Response('{}')),
      ).rejects.toMatchObject({ code: 'CACHE_UNAVAILABLE' });
    });
  });

  describe('match()', () => {
    it('devuelve la respuesta almacenada', async () => {
      const { service, cacheStorage, cache } = createService();
      const response = new Response('cached');
      cacheStorage.has.mockResolvedValue(true);
      cache.match.mockResolvedValue(response);

      await expect(service.match('app-v1', 'https://example.com/data.json')).resolves.toBe(response);
      expect(cache.match).toHaveBeenCalledWith('https://example.com/data.json');
    });

    it('devuelve undefined cuando la caché no existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);

      await expect(service.match('app-v1', 'https://example.com/data.json')).resolves.toBeUndefined();
      expect(cacheStorage.open).not.toHaveBeenCalled();
    });

    it('devuelve undefined cuando el recurso no está en la caché', async () => {
      const { service, cacheStorage, cache } = createService();
      cacheStorage.has.mockResolvedValue(true);
      cache.match.mockResolvedValue(undefined);

      await expect(service.match('app-v1', 'https://example.com/missing')).resolves.toBeUndefined();
    });

    it('envuelve los errores al consultar la respuesta', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockRejectedValue(new Error('native'));

      await expect(service.match('app-v1', 'https://example.com/data.json')).rejects.toMatchObject({
        code: 'CACHE_READ_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.match('app-v1', 'https://example.com/data.json')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('matchAll()', () => {
    it('devuelve todas las respuestas de la caché', async () => {
      const { service, cacheStorage, cache } = createService();
      const responses = [new Response('one')];
      cacheStorage.has.mockResolvedValue(true);
      cache.matchAll.mockResolvedValue(responses);

      await expect(service.matchAll('app-v1')).resolves.toEqual(responses);
      expect(cache.matchAll).toHaveBeenCalledWith();
    });

    it('filtra las respuestas por recurso', async () => {
      const { service, cacheStorage, cache } = createService();
      const responses = [new Response('one')];
      cacheStorage.has.mockResolvedValue(true);
      cache.matchAll.mockResolvedValue(responses);

      await expect(service.matchAll('app-v1', 'https://example.com/data.json')).resolves.toEqual(
        responses,
      );
      expect(cache.matchAll).toHaveBeenCalledWith('https://example.com/data.json');
    });

    it('devuelve una lista vacía cuando la caché no existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);

      await expect(service.matchAll('app-v1')).resolves.toEqual([]);
      expect(cacheStorage.open).not.toHaveBeenCalled();
    });

    it('envuelve los errores al consultar los recursos', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(true);
      cacheStorage.open.mockRejectedValue(new Error('native'));

      await expect(service.matchAll('app-v1')).rejects.toMatchObject({
        code: 'CACHE_READ_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.matchAll('app-v1')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('remove()', () => {
    it('elimina un recurso existente y devuelve true', async () => {
      const { service, cacheStorage, cache } = createService();
      cacheStorage.has.mockResolvedValue(true);
      cache.delete.mockResolvedValue(true);

      await expect(service.remove('app-v1', 'https://example.com/data.json')).resolves.toBe(true);
      expect(cache.delete).toHaveBeenCalledWith('https://example.com/data.json');
    });

    it('devuelve false cuando el recurso no existe', async () => {
      const { service, cacheStorage, cache } = createService();
      cacheStorage.has.mockResolvedValue(true);
      cache.delete.mockResolvedValue(false);

      await expect(service.remove('app-v1', 'https://example.com/missing')).resolves.toBe(false);
    });

    it('devuelve false cuando la caché no existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);

      await expect(service.remove('app-v1', 'https://example.com/data.json')).resolves.toBe(false);
      expect(cacheStorage.open).not.toHaveBeenCalled();
    });

    it('envuelve los errores al eliminar el recurso', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(true);
      cacheStorage.open.mockRejectedValue(new Error('native'));

      await expect(
        service.remove('app-v1', 'https://example.com/data.json'),
      ).rejects.toMatchObject({ code: 'CACHE_DELETE_FAILED' });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(
        service.remove('app-v1', 'https://example.com/data.json'),
      ).rejects.toMatchObject({ code: 'CACHE_UNAVAILABLE' });
    });
  });

  describe('clear()', () => {
    it('vacía la caché y devuelve true', async () => {
      const { service, cacheStorage, cache } = createService();
      const requests = ['https://example.com/a', 'https://example.com/b'];
      cacheStorage.has.mockResolvedValue(true);
      cache.keys.mockResolvedValue(requests);
      cache.delete.mockResolvedValue(true);

      await expect(service.clear('app-v1')).resolves.toBe(true);
      expect(cache.delete).toHaveBeenCalledTimes(2);
      expect(cache.delete).toHaveBeenNthCalledWith(1, 'https://example.com/a');
      expect(cache.delete).toHaveBeenNthCalledWith(2, 'https://example.com/b');
    });

    it('devuelve false cuando la caché no existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.has.mockResolvedValue(false);

      await expect(service.clear('app-v1')).resolves.toBe(false);
      expect(cacheStorage.open).not.toHaveBeenCalled();
    });

    it('envuelve los errores al vaciar la caché', async () => {
      const { service, cacheStorage, cache } = createService();
      cacheStorage.has.mockResolvedValue(true);
      cache.keys.mockRejectedValue(new Error('native'));

      await expect(service.clear('app-v1')).rejects.toMatchObject({
        code: 'CACHE_DELETE_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.clear('app-v1')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });

  describe('delete()', () => {
    it('elimina la caché y devuelve true', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.delete.mockResolvedValue(true);

      await expect(service.delete('app-v1')).resolves.toBe(true);
      expect(cacheStorage.delete).toHaveBeenCalledWith('app-v1');
    });

    it('devuelve false cuando la caché no existe', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.delete.mockResolvedValue(false);

      await expect(service.delete('app-v1')).resolves.toBe(false);
    });

    it('envuelve los errores al eliminar la caché', async () => {
      const { service, cacheStorage } = createService();
      cacheStorage.delete.mockRejectedValue(new Error('native'));

      await expect(service.delete('app-v1')).rejects.toMatchObject({
        code: 'CACHE_DELETE_FAILED',
      });
    });

    it('falla cuando Cache Storage no está disponible', async () => {
      const { service } = createService(null);

      await expect(service.delete('app-v1')).rejects.toMatchObject({
        code: 'CACHE_UNAVAILABLE',
      });
    });
  });
});
