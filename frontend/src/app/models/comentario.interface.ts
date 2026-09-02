export interface Comentario {
  id: number;
  contenido: string;
  fecha_publicacion: Date;
  puntuacion: number; // 1 a 5
  usuario: any; 
}