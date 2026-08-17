export interface Producto {
  id?: string;
  nombre: string;
  categoria: string | number; 
  descripcion: string;
  precio: number;
}