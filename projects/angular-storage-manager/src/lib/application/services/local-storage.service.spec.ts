import { TestBed } from '@angular/core/testing';
import { StorageError } from '../../core/errors/storage.error';
import { LOCAL_STORAGE } from '../../infrastructure/tokens/local-storage.token';
import { LocalStorageService } from './local-storage.service';

type StorageMock = jest.Mocked<Storage>;

function createStorageMock(): StorageMock {
  return {
    length: 0,
    clear: jest.fn(),
    getItem: jest.fn(),
    key: jest.fn(),
    removeItem: jest.fn(),
    setItem: jest.fn(),
  };
}

function createService(storage: Storage | null = createStorageMock()): {
  service: LocalStorageService;
  storage: StorageMock;
} {
  const storageMock = storage as StorageMock;

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: LOCAL_STORAGE, useValue: storage }],
  });

  return { service: TestBed.inject(LocalStorageService), storage: storageMock };
}

describe('LocalStorageService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('set()', () => {
    it('guarda objetos serializados como JSON', () => {
      const { service, storage } = createService();

      service.set('profile', { name: 'Ana', active: true });

      expect(storage.setItem).toHaveBeenCalledWith(
        'profile',
        JSON.stringify({ name: 'Ana', active: true }),
      );
    });

    it('guarda valores primitivos', () => {
      const { service, storage } = createService();

      service.set('count', 3);
      service.set('enabled', true);
      service.set('label', 'demo');

      expect(storage.setItem).toHaveBeenNthCalledWith(1, 'count', '3');
      expect(storage.setItem).toHaveBeenNthCalledWith(2, 'enabled', 'true');
      expect(storage.setItem).toHaveBeenNthCalledWith(3, 'label', '"demo"');
    });

    it('rechaza valores undefined', () => {
      const { service, storage } = createService();

      expect(() => service.set('key', undefined)).toThrow(
        new StorageError(
          'SERIALIZATION_FAILED',
          'El valor de la clave "key" es undefined y no se puede serializar.',
        ),
      );
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('rechaza valores que JSON.stringify no puede representar', () => {
      const { service, storage } = createService();

      expect(() => service.set('key', () => undefined)).toThrow(
        new StorageError(
          'SERIALIZATION_FAILED',
          'El valor de la clave "key" no es serializable a JSON.',
        ),
      );
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('envuelve los errores de JSON.stringify conservando la causa', () => {
      const { service } = createService();
      const value = { big: BigInt(1) };

      expect(() => service.set('key', value)).toThrow(StorageError);

      try {
        service.set('key', value);
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('SERIALIZATION_FAILED');
        expect((error as StorageError).cause).toBeInstanceOf(TypeError);
      }
    });

    it('propaga los StorageError lanzados durante la serialización', () => {
      const { service } = createService();
      const customError = new StorageError('SERIALIZATION_FAILED', 'fallo personalizado');
      const value = {
        toJSON(): never {
          throw customError;
        },
      };

      expect(() => service.set('key', value)).toThrow(customError);
    });

    it('envuelve los errores de escritura del navegador', () => {
      const { service, storage } = createService();
      const nativeError = new Error('QuotaExceededError');
      storage.setItem.mockImplementation(() => {
        throw nativeError;
      });

      expect(() => service.set('key', 'value')).toThrow(StorageError);

      try {
        service.set('key', 'value');
      } catch (error) {
        expect((error as StorageError).code).toBe('WRITE_FAILED');
        expect((error as StorageError).cause).toBe(nativeError);
      }
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.set('key', 'value')).toThrow(
        new StorageError('STORAGE_UNAVAILABLE', 'LocalStorage no está disponible en este entorno.'),
      );
    });
  });

  describe('get()', () => {
    it('recupera y deserializa el valor almacenado', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue(JSON.stringify({ name: 'Ana' }));

      expect(service.get<{ name: string }>('profile')).toEqual({ name: 'Ana' });
    });

    it('recupera primitivos y valores nulos', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValueOnce('42').mockReturnValueOnce('null');

      expect(service.get<number>('answer')).toBe(42);
      expect(service.get('empty')).toBeNull();
    });

    it('devuelve null cuando la clave no existe', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue(null);

      expect(service.get('missing')).toBeNull();
    });

    it('falla si el contenido almacenado no es JSON válido', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue('{invalid');

      expect(() => service.get('broken')).toThrow(StorageError);

      try {
        service.get('broken');
      } catch (error) {
        expect((error as StorageError).code).toBe('DESERIALIZATION_FAILED');
        expect((error as StorageError).cause).toBeInstanceOf(SyntaxError);
      }
    });

    it('envuelve los errores de lectura del navegador', () => {
      const { service, storage } = createService();
      const nativeError = new Error('SecurityError');
      storage.getItem.mockImplementation(() => {
        throw nativeError;
      });

      expect(() => service.get('key')).toThrow(StorageError);

      try {
        service.get('key');
      } catch (error) {
        expect((error as StorageError).code).toBe('READ_FAILED');
        expect((error as StorageError).cause).toBe(nativeError);
      }
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.get('key')).toThrow(
        new StorageError('STORAGE_UNAVAILABLE', 'LocalStorage no está disponible en este entorno.'),
      );
    });
  });

  describe('has()', () => {
    it('devuelve true cuando la clave existe', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue('"value"');

      expect(service.has('key')).toBe(true);
    });

    it('devuelve false cuando la clave no existe', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue(null);

      expect(service.has('key')).toBe(false);
    });

    it('envuelve los errores de lectura al comprobar la clave', () => {
      const { service, storage } = createService();
      storage.getItem.mockImplementation(() => {
        throw new Error('blocked');
      });

      expect(() => service.has('key')).toThrow(StorageError);

      try {
        service.has('key');
      } catch (error) {
        expect((error as StorageError).code).toBe('READ_FAILED');
      }
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.has('key')).toThrow(StorageError);
    });
  });

  describe('update()', () => {
    it('actualiza una clave existente y devuelve true', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue('"old"');

      expect(service.update('key', 'new')).toBe(true);
      expect(storage.setItem).toHaveBeenCalledWith('key', '"new"');
    });

    it('devuelve false y no escribe cuando la clave no existe', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue(null);

      expect(service.update('key', 'new')).toBe(false);
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.update('key', 'new')).toThrow(StorageError);
    });
  });

  describe('remove()', () => {
    it('elimina una clave existente y devuelve true', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue('"value"');

      expect(service.remove('key')).toBe(true);
      expect(storage.removeItem).toHaveBeenCalledWith('key');
    });

    it('devuelve false cuando la clave no existe', () => {
      const { service, storage } = createService();
      storage.getItem.mockReturnValue(null);

      expect(service.remove('key')).toBe(false);
      expect(storage.removeItem).toHaveBeenCalledWith('key');
    });

    it('envuelve los errores al eliminar', () => {
      const { service, storage } = createService();
      storage.removeItem.mockImplementation(() => {
        throw new Error('blocked');
      });

      expect(() => service.remove('key')).toThrow(StorageError);

      try {
        service.remove('key');
      } catch (error) {
        expect((error as StorageError).code).toBe('REMOVE_FAILED');
      }
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.remove('key')).toThrow(StorageError);
    });
  });

  describe('clear()', () => {
    it('vacía el almacenamiento', () => {
      const { service, storage } = createService();

      service.clear();

      expect(storage.clear).toHaveBeenCalledTimes(1);
    });

    it('envuelve los errores al vaciar el almacenamiento', () => {
      const { service, storage } = createService();
      storage.clear.mockImplementation(() => {
        throw new Error('blocked');
      });

      expect(() => service.clear()).toThrow(StorageError);

      try {
        service.clear();
      } catch (error) {
        expect((error as StorageError).code).toBe('CLEAR_FAILED');
      }
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.clear()).toThrow(StorageError);
    });
  });

  describe('keys()', () => {
    it('devuelve las claves existentes', () => {
      const { service, storage } = createService();
      storage.length = 3;
      storage.key.mockImplementation((index: number) => ['first', 'second', null][index] ?? null);

      expect(service.keys()).toEqual(['first', 'second']);
    });

    it('devuelve una lista vacía cuando no hay claves', () => {
      const { service, storage } = createService();
      storage.length = 0;

      expect(service.keys()).toEqual([]);
    });

    it('envuelve los errores al obtener las claves', () => {
      const { service, storage } = createService();
      storage.length = 1;
      storage.key.mockImplementation(() => {
        throw new Error('blocked');
      });

      expect(() => service.keys()).toThrow(StorageError);

      try {
        service.keys();
      } catch (error) {
        expect((error as StorageError).code).toBe('READ_FAILED');
      }
    });

    it('falla cuando LocalStorage no está disponible', () => {
      const { service } = createService(null);

      expect(() => service.keys()).toThrow(StorageError);
    });
  });
});
