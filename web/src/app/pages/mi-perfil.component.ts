import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion, Usuario } from '../models';
import { AuthService } from '../services/auth.service';
import { errorMessage } from '../services/error-message';
import { PublicacionesService } from '../services/publicaciones.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="profile-page">
      <p class="eyebrow">TU ESPACIO EN CONECTA</p>
      @if (usuario(); as profile) {
        <article class="panel profile-card">
          @if (profile.fotoPerfilUrl) {
            <img class="profile-avatar" [src]="imageUrl(profile.fotoPerfilUrl)" alt="Foto de perfil">
          } @else {
            <span class="profile-avatar avatar-placeholder">{{ profile.nombre.slice(0, 1) }}</span>
          }
          <div class="profile-info">
            <h1>{{ profile.nombre }} {{ profile.apellido }}</h1>
            <p class="profile-handle">&#64;{{ profile.username }}</p>
            <p>{{ profile.email }}</p>
            @if (profile.fechaNacimiento) { <p class="muted">Nacimiento: {{ profile.fechaNacimiento | date:'longDate' }}</p> }
            <p class="bio">{{ profile.biografia || 'Todavía no agregaste una biografía.' }}</p>
          </div>
        </article>
      }
      <div class="section-title"><h2>Tus últimas publicaciones</h2><span class="muted">Hasta 3 publicaciones recientes</span></div>
      @if (loading()) {
        <p class="empty-state">Cargando tu perfil...</p>
      } @else if (posts().length === 0) {
        <div class="panel empty-state">Todavía no publicaste nada. Compartí tu primera historia en el muro.</div>
      } @else {
        @for (post of posts(); track post._id) {
          <article class="panel profile-post">
            <div class="profile-post-meta">
              <span class="eyebrow">{{ post.createdAt | date:'medium' }}</span>
              <span>♥ {{ post.likesCount ?? post.likes.length }}</span>
            </div>
            <h3>{{ post.titulo }}</h3>
            <p>{{ post.descripcion }}</p>
            @if (post.imagenUrl) { <img class="post-image profile-post-image" [src]="imageUrl(post.imagenUrl)" [alt]="post.titulo"> }
            <div class="profile-comments">
              <strong>Comentarios ({{ post.comentarios.length }})</strong>
              @if (post.comentarios.length === 0) {
                <p class="muted">Esta publicación aún no tiene comentarios.</p>
              }
              @for (comment of post.comentarios; track comment._id) {
                <p><strong>{{ commentUsername(comment) }}</strong> {{ comment.texto }}</p>
              }
            </div>
          </article>
        }
      }
    </section>
  `,
})
export class MiPerfilComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(PublicacionesService);
  private readonly toast = inject(ToastService);
  readonly usuario = signal<Usuario | null>(this.auth.usuario());
  readonly posts = signal<Publicacion[]>([]);
  readonly loading = signal(true);

  constructor() {
    const user = this.usuario();
    if (!user) {
      this.loading.set(false);
      return;
    }
    this.auth.refreshProfile().subscribe({
      next: (profile) => this.usuario.set(profile),
      error: (error: unknown) => this.toast.error(errorMessage(error, 'No se pudo actualizar tu información de perfil.')),
    });
    this.api.listar({ limit: 3, offset: 0, orden: 'fecha', authorId: user._id }).subscribe({
      next: (posts) => this.posts.set(posts),
      error: (error: unknown) => {
        this.loading.set(false);
        this.toast.error(errorMessage(error, 'No se pudo cargar tu perfil.'));
      },
      complete: () => this.loading.set(false),
    });
  }

  commentUsername(comment: Publicacion['comentarios'][number]): string {
    return typeof comment.autorId === 'string' ? 'usuario' : comment.autorId.username;
  }

  imageUrl(path: string): string {
    return path.startsWith('http') ? path : `${environment.apiUrl}${path}`;
  }
}
