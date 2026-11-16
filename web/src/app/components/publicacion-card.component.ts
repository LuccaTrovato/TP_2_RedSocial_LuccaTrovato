import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Publicacion, Usuario } from '../models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <article class="panel post-card">
      <header class="post-author">
        @if (author()?.fotoPerfilUrl; as photoUrl) {
          <img class="avatar" [src]="imageUrl(photoUrl)" alt="">
        } @else {
          <span class="avatar avatar-placeholder">{{ author()?.nombre?.slice(0, 1) ?? '?' }}</span>
        }
        <div>
          <strong>{{ author()?.nombre }} {{ author()?.apellido }}</strong>
          <span class="muted">&#64;{{ author()?.username }} · {{ post().createdAt | date:'short' }}</span>
        </div>
        @if (canDelete()) {
          <button class="icon-button delete-button" type="button" aria-label="Eliminar publicación" (click)="remove.emit(post()._id)">Eliminar</button>
        }
      </header>
      <h2 class="post-title">{{ post().titulo }}</h2>
      <p class="post-description">{{ post().descripcion }}</p>
      @if (post().imagenUrl) {
        <img class="post-image" [src]="imageUrl(post().imagenUrl)" [alt]="post().titulo">
      }
      <div class="post-actions">
        <button type="button" class="like-button" [class.liked]="liked()" (click)="toggleLike.emit(post()._id)">
          {{ liked() ? '♥ Te gusta' : '♡ Me gusta' }} · {{ post().likesCount ?? post().likes.length }}
        </button>
        <span class="muted">{{ post().comentarios.length }} comentarios</span>
      </div>
      <section class="comments">
        @for (comment of post().comentarios; track comment._id) {
          <p><strong>{{ commentAuthor(comment)?.username ?? 'usuario' }}</strong> {{ comment.texto }}</p>
        }
        <form class="comment-form" (submit)="submitComment($event)">
          <input aria-label="Escribir comentario" placeholder="Escribí un comentario..." [value]="commentText" (input)="setComment($event)">
          <button type="submit" class="button button-small" [disabled]="!commentText.trim()">Enviar</button>
        </form>
      </section>
    </article>
  `,
})
export class PublicacionCardComponent {
  readonly post = input.required<Publicacion>();
  readonly liked = input(false);
  readonly canDelete = input(false);
  readonly toggleLike = output<string>();
  readonly remove = output<string>();
  readonly comment = output<{ id: string; texto: string }>();
  commentText = '';

  author(): Partial<Usuario> | null {
    const author = this.post().autorId;
    return typeof author === 'string' ? null : author;
  }

  commentAuthor(comment: Publicacion['comentarios'][number]): Partial<Usuario> | null {
    return typeof comment.autorId === 'string' ? null : comment.autorId;
  }

  imageUrl(path: string): string {
    return path.startsWith('http') ? path : `${environment.apiUrl}${path}`;
  }

  setComment(event: Event): void {
    this.commentText = (event.target as HTMLInputElement).value;
  }

  submitComment(event: Event): void {
    event.preventDefault();
    const texto = this.commentText.trim();
    if (!texto) return;
    this.comment.emit({ id: this.post()._id, texto });
    this.commentText = '';
  }
}
