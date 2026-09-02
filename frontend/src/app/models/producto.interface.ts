export interface Producto {
  id?: string;
  nombre: string;
  categoria?: string | number | { nombre?: string } | { id?: string; nombre?: string };
  descripcion: string;
  precio: number;
  imagen?: string;
}