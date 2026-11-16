import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'publicaciones',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login.component').then((module) => module.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro.component').then((module) => module.RegistroComponent),
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/publicaciones.component').then(
        (module) => module.PublicacionesComponent,
      ),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/mi-perfil.component').then(
        (module) => module.MiPerfilComponent,
      ),
  },
  { path: '**', redirectTo: 'publicaciones' },
];
