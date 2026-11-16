import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionCardComponent } from '../components/publicacion-card.component';
import { Publicacion } from '../models';
import { AuthService } from '../services/auth.service';
import { errorMessage } from '../services/error-message';
import { PublicacionesService } from '../services/publicaciones.service';
import { ToastService } from '../services/toast.service';

const PAGE_SIZE = 6;

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PublicacionCardComponent],
  template: `
    <section class="feed-header">
      <div>
        <p class="eyebrow">EL PUNTO DE ENCUENTRO</p>
        <h1>El muro</h1>
        <p class="muted">Ideas, momentos e historias de la comunidad.</p>
      </div>
      <label class="sort-control">Ordenar por
        <select [value]="orden()" (change)="changeOrder($event)">
          <option value="fecha">Más recientes</option>
          <option value="likes">Más populares</option>
        </select>
      </label>
    </section>

    <form class="panel compose-form" [formGroup]="form" (ngSubmit)="createPost()">
      <h2>Compartí algo nuevo</h2>
      <input aria-label="Título" placeholder="Título de tu publicación" formControlName="titulo">
      <textarea aria-label="Descripción" placeholder="¿Qué querés contar?" rows="3" formControlName="descripcion"></textarea>
      <div class="compose-actions">
        <label class="file-label">Agregar imagen
          <input type="file" accept="image/png,image/jpeg,image/webp" (change)="selectImage($event)">
        </label>
        <button class="button" type="submit" [disabled]="form.invalid || saving()">Publicar</button>
      </div>
    </form>

    <section class="feed-list" aria-live="polite">
      @if (loading()) {
        <p class="empty-state">Cargando publicaciones...</p>
      } @else if (posts().length === 0) {
        <div class="panel empty-state"><h2>El muro está tranquilo</h2><p>¡Sé la primera persona en compartir algo!</p></div>
      } @else {
        @for (post of posts(); track post._id) {
          <app-publicacion-card
            [post]="post"
            [liked]="isLiked(post)"
            [canDelete]="canDelete(post)"
            (toggleLike)="toggleLike($event)"
            (remove)="deletePost($event)"
            (comment)="addComment($event)"
          />
        }
      }
    </section>
    <nav class="pagination" aria-label="Paginación">
      <button class="button button-quiet" type="button" [disabled]="offset() === 0 || loading()" (click)="previous()">Anterior</button>
      <span class="muted">Página {{ page() }}</span>
      <button class="button button-quiet" type="button" [disabled]="posts().length < pageSize || loading()" (click)="next()">Siguiente</button>
    </nav>
  `,
})
export class PublicacionesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicacionesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly posts = signal<Publicacion[]>([]);
  readonly offset = signal(0);
  readonly orden = signal<'fecha' | 'likes'>('fecha');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly page = computed(() => Math.floor(this.offset() / PAGE_SIZE) + 1);
  readonly pageSize = PAGE_SIZE;
  private image?: File;

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listar({ limit: PAGE_SIZE, offset: this.offset(), orden: this.orden() }).subscribe({
      next: (posts) => this.posts.set(posts),
      error: (error: unknown) => {
        this.loading.set(false);
        this.toast.error(errorMessage(error, 'No se pudieron cargar las publicaciones.'));
      },
      complete: () => this.loading.set(false),
    });
  }

  changeOrder(event: Event): void {
    this.orden.set((event.target as HTMLSelectElement).value as 'fecha' | 'likes');
    this.offset.set(0);
    this.load();
  }

  selectImage(event: Event): void {
    this.image = (event.target as HTMLInputElement).files?.[0];
  }

  createPost(): void {
    if (this.form.invalid || this.saving()) return;
    const data = new FormData();
    const fields = this.form.getRawValue();
    data.append('titulo', fields.titulo);
    data.append('descripcion', fields.descripcion);
    if (this.image) data.append('imagen', this.image);
    this.saving.set(true);
    this.api.crear(data).subscribe({
      next: () => {
        this.form.reset();
        this.image = undefined;
        this.offset.set(0);
        this.toast.success('Publicación creada.');
        this.load();
      },
      error: (error: unknown) => this.toast.error(errorMessage(error, 'No se pudo crear la publicación.')),
      complete: () => this.saving.set(false),
    });
  }

  isLiked(post: Publicacion): boolean {
    const userId = this.auth.usuario()?._id;
    return !!userId && post.likes.some((like) => String(like) === userId);
  }

  canDelete(post: Publicacion): boolean {
    const current = this.auth.usuario();
    const authorId = typeof post.autorId === 'string' ? post.autorId : post.autorId._id;
    return !!current && (current._id === authorId || current.rol === 'administrador');
  }

  toggleLike(id: string): void {
    const post = this.posts().find((item) => item._id === id);
    if (!post) return;
    const liked = this.isLiked(post);
    const action = liked ? this.api.quitarLike(id) : this.api.darLike(id);
    action.subscribe({
      next: () => {
        this.posts.update((posts) =>
          posts.map((item) => {
            if (item._id !== id) return item;
            const userId = this.auth.usuario()?._id ?? '';
            const likes = liked
              ? item.likes.filter((like) => String(like) !== userId)
              : [...item.likes, userId];
            return { ...item, likes, likesCount: likes.length };
          }),
        );
      },
      error: (error: unknown) => this.toast.error(errorMessage(error, 'No se pudo actualizar el me gusta.')),
    });
  }

  deletePost(id: string): void {
    this.api.eliminar(id).subscribe({
      next: () => {
        this.posts.update((posts) => posts.filter((post) => post._id !== id));
        this.toast.success('Publicación eliminada.');
      },
      error: (error: unknown) => this.toast.error(errorMessage(error, 'No se pudo eliminar la publicación.')),
    });
  }

  addComment(comment: { id: string; texto: string }): void {
    this.api.comentar(comment.id, comment.texto).subscribe({
      next: (updated) => {
        this.posts.update((posts) => posts.map((post) => post._id === updated._id ? updated : post));
      },
      error: (error: unknown) => this.toast.error(errorMessage(error, 'No se pudo agregar el comentario.')),
    });
  }

  previous(): void {
    this.offset.set(Math.max(0, this.offset() - PAGE_SIZE));
    this.load();
  }

  next(): void {
    if (this.posts().length < PAGE_SIZE) return;
    this.offset.update((value) => value + PAGE_SIZE);
    this.load();
  }
}
