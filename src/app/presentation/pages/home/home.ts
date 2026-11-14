import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RoadmapStep {
  readonly number: number;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly packageName = '@josefo_pro/angular-storage-manager';
  protected readonly packageVersion = '0.1.0';
  protected readonly installCommand = 'npm install @josefo_pro/angular-storage-manager';
  protected readonly repositoryUrl =
    'https://github.com/jose-alejandro-loaiza-lopez/Uceva-Angular-Taller-Storage-Manager';
  protected readonly npmUrl = 'https://www.npmjs.com/package/@josefo_pro/angular-storage-manager';
  protected readonly docsUrl =
    'https://jose-alejandro-loaiza-lopez.github.io/Uceva-Angular-Taller-Storage-Manager/documentation/';

  protected readonly steps: readonly RoadmapStep[] = [
    {
      number: 1,
      title: 'Creación y configuración del proyecto',
      description: 'Workspace de Angular con la librería y la aplicación Showcase separadas.',
    },
    {
      number: 2,
      title: 'Servicio LocalStorage',
      description: 'CRUD tipado, serialización JSON y manejo de errores con código.',
    },
    {
      number: 3,
      title: 'Servicio Cache Storage',
      description: 'Gestión de cachés, respuestas HTTP, recursos y eliminación.',
    },
    {
      number: 4,
      title: 'Configuración de la API pública',
      description: 'public-api.ts expone solo servicios, contratos, modelos y errores.',
    },
    {
      number: 5,
      title: 'Pruebas unitarias',
      description: '84 pruebas con 100% de cobertura en statements, branches, functions y lines.',
    },
    {
      number: 6,
      title: 'Documentación técnica',
      description: 'Compodoc para la API y README.md con instalación, configuración y ejemplos.',
    },
    {
      number: 7,
      title: 'Publicación en NPM',
      description: 'Paquete 0.1.0 publicado y validado en un proyecto Angular independiente.',
    },
    {
      number: 8,
      title: 'Showcase',
      description: 'Aplicación que consume la librería publicada desde NPM y demuestra sus servicios.',
    },
  ];

  protected readonly errorCodes: readonly string[] = [
    'STORAGE_UNAVAILABLE',
    'SERIALIZATION_FAILED',
    'DESERIALIZATION_FAILED',
    'WRITE_FAILED',
    'READ_FAILED',
    'REMOVE_FAILED',
    'CLEAR_FAILED',
    'CACHE_UNAVAILABLE',
    'CACHE_OPEN_FAILED',
    'CACHE_WRITE_FAILED',
    'CACHE_READ_FAILED',
    'CACHE_DELETE_FAILED',
  ];
}
