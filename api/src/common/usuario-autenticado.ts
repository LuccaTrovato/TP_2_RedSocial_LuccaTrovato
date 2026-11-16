export interface UsuarioAutenticado {
  sub: string;
  email: string;
  username: string;
  rol: 'usuario' | 'administrador';
}
