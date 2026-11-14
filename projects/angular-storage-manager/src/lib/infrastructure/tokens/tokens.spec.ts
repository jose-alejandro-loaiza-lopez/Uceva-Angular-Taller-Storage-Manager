import { TestBed } from '@angular/core/testing';
import { CACHE_STORAGE } from './cache-storage.token';
import { LOCAL_STORAGE } from './local-storage.token';

const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');

function restoreProperty(name: 'localStorage' | 'caches'): void {
  const original = name === 'localStorage' ? originalLocalStorage : originalCaches;

  if (original) {
    Object.defineProperty(globalThis, name, original);
    return;
  }

  Reflect.deleteProperty(globalThis, name);
}

describe('LOCAL_STORAGE token', () => {
  afterEach(() => {
    restoreProperty('localStorage');
    TestBed.resetTestingModule();
  });

  it('resuelve el localStorage del navegador', () => {
    const storage = TestBed.inject(LOCAL_STORAGE);

    expect(storage).not.toBeNull();
    expect(storage).toBe(globalThis.localStorage);
  });

  it('devuelve null cuando localStorage no existe en el entorno', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined,
    });

    expect(TestBed.inject(LOCAL_STORAGE)).toBeNull();
  });

  it('devuelve null cuando el acceso a localStorage lanza un error', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get(): never {
        throw new Error('acceso bloqueado');
      },
    });

    expect(TestBed.inject(LOCAL_STORAGE)).toBeNull();
  });
});

describe('CACHE_STORAGE token', () => {
  afterEach(() => {
    restoreProperty('caches');
    TestBed.resetTestingModule();
  });

  it('devuelve null cuando Cache Storage no está soportado', () => {
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: undefined,
    });

    expect(TestBed.inject(CACHE_STORAGE)).toBeNull();
  });

  it('resuelve la API Cache Storage del navegador', () => {
    const caches = {
      delete: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      match: jest.fn(),
      open: jest.fn(),
    } as unknown as CacheStorage;

    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: caches,
    });

    expect(TestBed.inject(CACHE_STORAGE)).toBe(caches);
  });

  it('devuelve null cuando el acceso a Cache Storage lanza un error', () => {
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      get(): never {
        throw new Error('acceso bloqueado');
      },
    });

    expect(TestBed.inject(CACHE_STORAGE)).toBeNull();
  });
});
