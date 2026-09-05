import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  private apiService = inject(ApiService);

  categorias = signal<any[]>([]);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  // Formulario Producto
  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: null as number | null,
    categoria: ''
  };

  // Formulario Categoría
  nuevaCategoriaNombre = '';

  constructor() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.apiService.getCategorias().subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.categorias.set(Array.isArray(data) ? data : []);
      },
      error: (err) => console.error('Error al traer categorías:', err)
    });
  }

  guardarCategoria() {
    this.limpiarMensajes();
    if (!this.nuevaCategoriaNombre.trim()) return;

    this.apiService.crearCategoria({ nombre: this.nuevaCategoriaNombre }).subscribe({
      next: () => {
        this.mensaje.set('Categoría creada exitosamente.');
        this.nuevaCategoriaNombre = '';
        this.cargarCategorias(); // Refresca el <select> de productos
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear categoría');
      }
    });
  }

  guardarProducto() {
    this.limpiarMensajes();
    this.apiService.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.mensaje.set('Producto creado exitosamente.');
        this.nuevoProducto = { nombre: '', descripcion: '', precio: null, categoria: '' };
      },
      error: (err) => {
        const errores = err.error?.errores?.join(', ') || err.error?.message || 'Error al crear producto';
        this.error.set(errores);
      }
    });
  }

  private limpiarMensajes() {
    this.mensaje.set(null);
    this.error.set(null);
  }
}