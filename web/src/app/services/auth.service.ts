import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sesion, Usuario } from '../models';

const SESSION_KEY = 'red-social-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentSession = signal<Sesion | null>(this.readSession());
  readonly session = this.currentSession.asReadonly();
  readonly usuario = computed(() => this.currentSession()?.usuario ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(identificador: string, password: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${environment.apiUrl}/auth/login`, { identificador, password })
      .pipe(tap((session) => this.saveSession(session)));
  }

  register(data: FormData): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${environment.apiUrl}/auth/registro`, data)
      .pipe(tap((session) => this.saveSession(session)));
  }

  refreshProfile(): Observable<Usuario> {
    return this.http
      .get<Usuario>(`${environment.apiUrl}/usuarios/perfil`)
      .pipe(tap((usuario) => this.updateUser(usuario)));
  }

  updateUser(usuario: Usuario): void {
    const current = this.currentSession();
    if (current) this.saveSession({ ...current, usuario });
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentSession.set(null);
    void this.router.navigate(['/login']);
  }

  private saveSession(session: Sesion): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.currentSession.set(session);
  }

  private readSession(): Sesion | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as Sesion;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
