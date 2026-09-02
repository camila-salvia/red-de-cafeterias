import { Component, inject, signal, computed } from '@angular/core';
// import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
// Importamos apuntando exactamente a tu archivo 'api.ts'
import { ApiService } from '../../services/api'; 
// Importamos componente de la tarjeta para usarlo en HTML
import { TarjetaProductoComponent } from '../../components/tarjeta-producto/tarjeta-producto';
import { Producto } from '../../models/producto.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TarjetaProductoComponent],
  templateUrl: './inicio.html', 
  styleUrl: './inicio.scss',
})

export class InicioComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  // Declaramos los Signals
  datosDelServidor = signal<any>([]); 
  errorMsg = signal<string | null>(null);

  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private obtenerCategoriaNombre(categoria: Producto['categoria']): string {
    if (!categoria) return '';

    if (typeof categoria === 'string' || typeof categoria === 'number') {
      return this.normalizarTexto(String(categoria));
    }

    if (typeof categoria === 'object') {
      const nombre = 'nombre' in categoria ? categoria.nombre : '';
      return this.normalizarTexto(String(nombre || ''));
    }

    return '';
  }

  //Filtro, por defecto muestra todos los productos
  filtroCategoria = signal<string>('TODO');
  productosFiltrados = computed(() => {
    const todos = Array.isArray(this.datosDelServidor()) ? this.datosDelServidor() : [];
    const filtro = this.filtroCategoria();

    if (filtro === 'TODO') return todos;

    return todos.filter((p: Producto) => {
      const categoria = this.obtenerCategoriaNombre(p.categoria);
      const nombre = this.normalizarTexto(p.nombre || '');

      if (filtro === 'BEBIDAS') {
        return categoria.includes('bebida') || nombre.includes('cafe') || nombre.includes('café');
      }

      if (filtro === 'COMIDA') {
        return categoria.includes('comida') || nombre.includes('lemon') || nombre.includes('pie');
      }

      return true;
    });
  });

  constructor() {
    this.apiService.getProductos().subscribe({
      next: (respuesta: any) => {
        //Verifica si backend envia productos envueltos en 'data'
        const productosReales = respuesta.data ? respuesta.data : respuesta;
        // Guardamos los datos si la petición es exitosa
        this.datosDelServidor.set(productosReales);
      },
      error: (err) => {
        // Guardamos el mensaje si el backend falla
        this.errorMsg.set(err.message);
      }
    });
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroCategoria.set(nuevoFiltro);
  }

  manejarAgregado(productoSeleccionado: any) {
    const token = localStorage.getItem('token_cafeteria');
    if(token) {
      console.log('Producto agregado exitoasmente: ', productoSeleccionado);
    } else {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
    }
  }
}