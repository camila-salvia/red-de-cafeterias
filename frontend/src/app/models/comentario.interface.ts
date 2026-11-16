export interface Comentario {
  id: string;
  contenido: string;
  fecha_publicacion: Date;
  puntuacion: number; // 1 a 5
  usuario: { id: string; nombre: string };
}

export type ComentarioApi = Omit<Comentario, 'fecha_publicacion'> & {
  fecha_publicacion: string;
};

export interface ComentariosResponse {
  data: ComentarioApi[];
}

export interface ComentarioResponse {
  data: ComentarioApi;
}