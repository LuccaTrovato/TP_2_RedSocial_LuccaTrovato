export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento?: string;
  biografia: string;
  fotoPerfilUrl: string;
  rol: 'usuario' | 'administrador';
}

export interface Comentario {
  _id: string;
  autorId: Pick<Usuario, 'nombre' | 'username' | 'fotoPerfilUrl'> | string;
  texto: string;
  createdAt: string;
}

export interface Publicacion {
  _id: string;
  autorId: Pick<Usuario, '_id' | 'nombre' | 'apellido' | 'username' | 'fotoPerfilUrl'> | string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  likes: string[];
  likesCount?: number;
  comentarios: Comentario[];
  createdAt: string;
}

export interface Sesion {
  usuario: Usuario;
  access_token: string;
}
