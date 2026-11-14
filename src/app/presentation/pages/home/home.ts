import { Component } from '@angular/core';

type StepStatus = 'done' | 'pending';

interface RoadmapStep {
  number: number;
  title: string;
  description: string;
  status: StepStatus;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly repositoryUrl =
    'https://github.com/jose-alejandro-loaiza-lopez/Uceva-Angular-Taller-Storage-Manager';

  protected readonly steps: readonly RoadmapStep[] = [
    {
      number: 1,
      title: 'Creación y configuración del proyecto',
      description: 'Workspace de Angular con la librería y la aplicación Showcase separadas.',
      status: 'done',
    },
    {
      number: 2,
      title: 'Servicio LocalStorage',
      description: 'CRUD tipado, serialización JSON y manejo de errores.',
      status: 'done',
    },
    {
      number: 3,
      title: 'Servicio Cache Storage',
      description: 'Gestión de cachés, respuestas HTTP y eliminación de recursos.',
      status: 'done',
    },
    {
      number: 4,
      title: 'Configuración de la API pública',
      description: 'public-api.ts expone solo los servicios, contratos, modelos y errores.',
      status: 'done',
    },
    {
      number: 5,
      title: 'Pruebas unitarias',
      description: 'Cobertura del 100% en statements, branches, functions y lines.',
      status: 'pending',
    },
    {
      number: 6,
      title: 'Documentación técnica',
      description: 'Compodoc y README.md con instalación, configuración y ejemplos.',
      status: 'pending',
    },
    {
      number: 7,
      title: 'Publicación en NPM',
      description: 'Build de producción y publicación del paquete en el registro.',
      status: 'pending',
    },
    {
      number: 8,
      title: 'Showcase',
      description: 'Aplicación que consume la librería publicada y demuestra sus funcionalidades.',
      status: 'pending',
    },
  ];
}
