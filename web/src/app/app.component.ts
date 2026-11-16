import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastComponent } from './components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/publicaciones"><span class="brand-mark">C</span> conecta</a>
      <nav aria-label="Navegación principal">
        @if (auth.usuario(); as usuario) {
          <a routerLink="/publicaciones" routerLinkActive="active">Muro</a>
          <a routerLink="/mi-perfil" routerLinkActive="active">Mi perfil</a>
          <span class="nav-user">Hola, {{ usuario.nombre }}</span>
          <button class="button button-quiet" type="button" (click)="auth.logout()">Salir</button>
        } @else {
          <a routerLink="/login" routerLinkActive="active">Ingresar</a>
          <a class="button button-small" routerLink="/registro">Crear cuenta</a>
        }
      </nav>
    </header>
    <main class="page-shell">
      <router-outlet />
    </main>
    <app-toast />
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
}
