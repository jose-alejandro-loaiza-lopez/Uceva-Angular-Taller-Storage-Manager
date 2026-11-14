import { Routes } from '@angular/router';
import { CacheStorageDemo } from './presentation/pages/cache-storage-demo/cache-storage-demo';
import { Home } from './presentation/pages/home/home';
import { LocalStorageDemo } from './presentation/pages/local-storage-demo/local-storage-demo';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'local-storage', component: LocalStorageDemo },
  { path: 'cache-storage', component: CacheStorageDemo },
  { path: '**', redirectTo: '' },
];
