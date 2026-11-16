import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Publicacion } from '../models';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly baseUrl = `${environment.apiUrl}/publicaciones`;

  constructor(private readonly http: HttpClient) {}

  listar(options: {
    limit: number;
    offset: number;
    orden: 'fecha' | 'likes';
    authorId?: string;
  }): Observable<Publicacion[]> {
    let params = new HttpParams()
      .set('limit', options.limit)
      .set('offset', options.offset)
      .set('orden', options.orden);
    if (options.authorId) params = params.set('authorId', options.authorId);
    return this.http.get<Publicacion[]>(this.baseUrl, { params });
  }

  crear(data: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.baseUrl, data);
  }

  darLike(id: string): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.baseUrl}/${id}/like`, {});
  }

  quitarLike(id: string): Observable<{ liked: boolean }> {
    return this.http.delete<{ liked: boolean }>(`${this.baseUrl}/${id}/like`);
  }

  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  comentar(id: string, texto: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.baseUrl}/${id}/comentarios`, { texto });
  }
}
