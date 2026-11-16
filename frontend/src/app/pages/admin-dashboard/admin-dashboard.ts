import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { urlImagenProducto } from '../../utils/imagen-url';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnDestroy {
  private apiService = inject(ApiService);
  @ViewChild('imagenInput') private imagenInput?: ElementRef<HTMLInputElement>;

  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  imagenSeleccionada = signal<File | null>(null);
  vistaPreviaImagen = signal<string | null>(null);
  private urlImagenTemporal: string | null = null;

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

  ngOnDestroy() {
    if (this.urlImagenTemporal) URL.revokeObjectURL(this.urlImagenTemporal);
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
    this.apiService.getProductosAdmin().subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.productos.set(Array.isArray(data) ? data : []);
      },
      error: (err) => this.error.set('Error al traer productos (admin):')
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
    const productoFormData = this.crearProductoFormData();
    if (idEdicion) {
      // modo edicion PUT
      this.apiService.actualizarProducto(idEdicion, productoFormData).subscribe({
        next: () => {
          this.mensaje.set('Producto actualizado exitosamente.');
          this.limpiarFormularioProducto();
          this.cargarProductos();
        },
        error: (err) => this.error.set('Error al actualizar producto.')
      });
    } else {
      // mode creacion POST  
      this.apiService.crearProducto(productoFormData).subscribe({
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
    this.limpiarImagenSeleccionada();
  }

  seleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    this.error.set(null);
    this.limpiarImagenSeleccionada();

    if (!archivo) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
      input.value = '';
      this.error.set('La imagen debe ser JPG, PNG o WebP.');
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      input.value = '';
      this.error.set('La imagen no puede superar los 5 MB.');
      return;
    }

    const urlTemporal = URL.createObjectURL(archivo);
    this.urlImagenTemporal = urlTemporal;
    this.imagenSeleccionada.set(archivo);
    this.vistaPreviaImagen.set(urlTemporal);
  }
       
  cambiarEstadoProducto(id: string, activoActual: boolean) {
    this.limpiarMensajes();
    const accion = activoActual ? 'desactivar' : 'activar';
    
    if (confirm(`¿Seguro que deseas ${accion} este producto?`)) {
      this.apiService.cambiarEstadoProducto(id).subscribe({
        next: (res: any) => {
          this.mensaje.set(res.message || 'Estado del producto actualizado exitosamente.');
          this.cargarProductos(); // Recarga la tabla completa para ver el nuevo estado
        },
        error: (err) => {
          this.error.set('Error al cambiar el estado del producto.');
        }
      });
    }
  }
  
  cargarParaEditar(producto: any) {
    this.limpiarImagenSeleccionada();
    this.nuevoProducto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria?.id || producto.categoria // Ajuste para manejar tanto objeto como string
    };
    this.vistaPreviaImagen.set(urlImagenProducto(producto.imagen) ?? null);
    this.productoEnEdicionId.set(producto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplaza hacia arriba para ver el formulario
  }

  private crearProductoFormData(): FormData {
    const formData = new FormData();
    formData.append('nombre', this.nuevoProducto.nombre);
    formData.append('descripcion', this.nuevoProducto.descripcion);
    formData.append('precio', String(Number(this.nuevoProducto.precio)));
    formData.append('categoria', this.nuevoProducto.categoria);

    const imagen = this.imagenSeleccionada();
    if (imagen) formData.append('imagen', imagen);

    return formData;
  }

  private limpiarImagenSeleccionada() {
    this.imagenSeleccionada.set(null);
    this.vistaPreviaImagen.set(null);
    if (this.urlImagenTemporal) URL.revokeObjectURL(this.urlImagenTemporal);
    this.urlImagenTemporal = null;
    if (this.imagenInput) this.imagenInput.nativeElement.value = '';
  }

  private limpiarMensajes() {
    this.mensaje.set(null);
    this.error.set(null);
  }
}