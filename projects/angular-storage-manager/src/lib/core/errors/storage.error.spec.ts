import { StorageError } from './storage.error';

describe('StorageError', () => {
  it('crea un error con código y mensaje', () => {
    const error = new StorageError('READ_FAILED', 'No se pudo leer');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(StorageError);
    expect(error.name).toBe('StorageError');
    expect(error.code).toBe('READ_FAILED');
    expect(error.message).toBe('No se pudo leer');
    expect(error.cause).toBeUndefined();
  });

  it('conserva el error original como causa', () => {
    const nativeError = new Error('native');
    const error = new StorageError('WRITE_FAILED', 'No se pudo escribir', { cause: nativeError });

    expect(error.code).toBe('WRITE_FAILED');
    expect(error.cause).toBe(nativeError);
  });
});
