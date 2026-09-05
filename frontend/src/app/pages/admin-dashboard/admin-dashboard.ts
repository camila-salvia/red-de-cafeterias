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
  productos = signal<any[]>([]);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  // Formulario Producto
  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: null as number | null,
    categoria: ''
  };

  // Producto en edición (si tiene ID es edición, si es null es creación)
  productoEnEdicionId = signal<string | null>(null);

  // Formulario Categoría
  nuevaCategoriaNombre = '';

  constructor() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.apiService.getCategorias().subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.categorias.set(Array.isArray(data) ? data : []);
      },
      error: (err) => this.error.set('Error al traer categorías:')
    });
  }

  cargarProductos() {
    this.apiService.getProductos().subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.productos.set(Array.isArray(data) ? data : []);
      },
      error: (err) => this.error.set('Error al traer productos:')
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

  eliminarCategoria(id: string) {
    this.limpiarMensajes();
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      this.apiService.eliminarCategoria(id).subscribe({
        next: () => {
          this.mensaje.set('Categoría eliminada exitosamente.');
          this.cargarCategorias(); // Recarga la tabla de categorias
        },
        error: (err) => {
          this.error.set('Error al eliminar. Recuerda que no puede tener productos asociados.');
        }
      });
    }
  }

  guardarProducto() {
    this.limpiarMensajes();
    const idEdicion = this.productoEnEdicionId();
    if (idEdicion) {
      // modo edicion PUT
      const productoFormateado = {
        ...this.nuevoProducto,
        precio: Number(this.nuevoProducto.precio)
      };
      this.apiService.actualizarProducto(idEdicion, productoFormateado).subscribe({
        next: () => {
          this.mensaje.set('Producto actualizado exitosamente.');
          this.limpiarFormularioProducto();
          this.cargarProductos();
        },
        error: (err) => this.error.set('Error al actualizar producto.')
      });
    } else {
      // mode creacion POST  
      this.apiService.crearProducto(this.nuevoProducto).subscribe({
        next: () => {
          this.mensaje.set('Producto creado exitosamente.');
          this.limpiarFormularioProducto();
          this.cargarProductos();
        },
        error: (err) => this.error.set('Error al crear producto.')
      });
    }
  }

  limpiarFormularioProducto() {
    this.nuevoProducto = {nombre: '', descripcion: '', precio: null, categoria: ''};
    this.productoEnEdicionId.set(null);
  }
       
  eliminarProducto(id: string) {
    this.limpiarMensajes();
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.apiService.eliminarProducto(id).subscribe({
        next: () => {
          this.mensaje.set('Producto eliminado exitosamente.');
          this.cargarProductos(); // Recarga la tabla de productos
        },
        error: (err) => {
          this.error.set('Error al eliminar producto.');
        }
      });
    }
  }    
  
  cargarParaEditar(producto: any) {
    this.nuevoProducto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria?.id || producto.categoria // Ajuste para manejar tanto objeto como string
    };
    this.productoEnEdicionId.set(producto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplaza hacia arriba para ver el formulario
  }

  private limpiarMensajes() {
    this.mensaje.set(null);
    this.error.set(null);
  }
}