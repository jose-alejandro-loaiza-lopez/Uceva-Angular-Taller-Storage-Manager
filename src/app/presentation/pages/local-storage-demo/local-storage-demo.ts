import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService, StorageError } from '@josefo_pro/angular-storage-manager';

interface StoredEntry {
  readonly key: string;
  readonly type: string;
  readonly preview: string;
}

interface LogEntry {
  readonly id: number;
  readonly level: 'success' | 'info' | 'error';
  readonly title: string;
  readonly detail?: string;
  readonly time: string;
}

function valueType(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

function valuePreview(value: unknown): string {
  const serialized = JSON.stringify(value) ?? String(value);

  return serialized.length > 90 ? `${serialized.slice(0, 90)}…` : serialized;
}

@Component({
  selector: 'app-local-storage-demo',
  imports: [FormsModule],
  templateUrl: './local-storage-demo.html',
  styleUrl: './local-storage-demo.scss',
})
export class LocalStorageDemo {
  private readonly storage = inject(LocalStorageService);
  private nextLogId = 0;

  protected readonly keyInput = signal('showcase-profile');
  protected readonly valueInput = signal('{\n  "name": "Ana",\n  "active": true,\n  "roles": ["admin"]\n}');
  protected readonly entries = signal<readonly StoredEntry[]>([]);
  protected readonly log = signal<readonly LogEntry[]>([]);
  protected readonly readResult = signal<string | null>(null);
  protected readonly exists = signal<boolean | null>(null);

  protected readonly valuePreview = computed(() => {
    const raw = this.valueInput();

    try {
      const value: unknown = JSON.parse(raw);
      return `JSON válido · tipo ${valueType(value)}`;
    } catch {
      return 'No es JSON: se guardará como texto plano (string).';
    }
  });

  constructor() {
    this.refresh();
    this.pushLog(
      'info',
      'Servicio listo',
      'LocalStorageService se inyectó desde @josefo_pro/angular-storage-manager.',
    );
  }

  protected save(): void {
    const key = this.currentKey();

    if (key === null) {
      return;
    }

    try {
      this.storage.set(key, this.parseValue());
      this.pushLog('success', 'set()', `Valor guardado en "${key}".`);
      this.refresh();
    } catch (error) {
      this.handleError('set()', error);
    }
  }

  protected update(): void {
    const key = this.currentKey();

    if (key === null) {
      return;
    }

    try {
      const updated = this.storage.update(key, this.parseValue());

      if (updated) {
        this.pushLog('success', 'update()', `Clave "${key}" actualizada.`);
      } else {
        this.pushLog('info', 'update()', `La clave "${key}" no existe; no se actualizó nada.`);
      }

      this.refresh();
    } catch (error) {
      this.handleError('update()', error);
    }
  }

  protected read(): void {
    const key = this.currentKey();

    if (key === null) {
      return;
    }

    try {
      const value = this.storage.get<unknown>(key);
      this.readResult.set(value === null ? null : JSON.stringify(value, null, 2));

      if (value === null) {
        this.pushLog('info', 'get()', `La clave "${key}" no existe.`);
      } else {
        this.pushLog('success', 'get()', `Se recuperó "${key}" (tipo ${valueType(value)}).`);
      }
    } catch (error) {
      this.handleError('get()', error);
    }
  }

  protected check(): void {
    const key = this.currentKey();

    if (key === null) {
      return;
    }

    try {
      const exists = this.storage.has(key);
      this.exists.set(exists);
      this.pushLog(
        exists ? 'success' : 'info',
        'has()',
        exists ? `La clave "${key}" existe.` : `La clave "${key}" no existe.`,
      );
    } catch (error) {
      this.handleError('has()', error);
    }
  }

  protected remove(): void {
    const key = this.currentKey();

    if (key === null) {
      return;
    }

    try {
      const removed = this.storage.remove(key);
      this.pushLog(
        removed ? 'success' : 'info',
        'remove()',
        removed ? `Clave "${key}" eliminada.` : `La clave "${key}" no existía.`,
      );
      this.refresh();
    } catch (error) {
      this.handleError('remove()', error);
    }
  }

  protected clear(): void {
    const confirmed = globalThis.confirm(
      'Se eliminarán todas las claves del LocalStorage de este origen. ¿Continuar?',
    );

    if (!confirmed) {
      return;
    }

    try {
      this.storage.clear();
      this.readResult.set(null);
      this.exists.set(null);
      this.pushLog('success', 'clear()', 'Se vació el LocalStorage del origen actual.');
      this.refresh();
    } catch (error) {
      this.handleError('clear()', error);
    }
  }

  protected refresh(): void {
    try {
      const entries = this.storage.keys().map((key): StoredEntry => {
        try {
          const value = this.storage.get<unknown>(key);

          return {
            key,
            type: valueType(value),
            preview: valuePreview(value),
          };
        } catch {
          return {
            key,
            type: 'inválido',
            preview: 'El contenido almacenado no es un JSON válido.',
          };
        }
      });

      this.entries.set(entries);
    } catch (error) {
      this.handleError('keys()', error);
    }
  }

  protected selectEntry(key: string): void {
    this.keyInput.set(key);
    this.read();
  }

  private currentKey(): string | null {
    const key = this.keyInput().trim();

    if (key.length === 0) {
      this.pushLog('error', 'Validación', 'La clave es obligatoria.');
      return null;
    }

    return key;
  }

  private parseValue(): unknown {
    const raw = this.valueInput();

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
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
