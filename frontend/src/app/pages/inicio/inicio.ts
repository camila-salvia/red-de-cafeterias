import { Component, inject, signal, computed } from '@angular/core';
// import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api'; 
import { CartService } from '../../services/cart.js';
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
  private cartService = inject(CartService);

  // Lista directa desde el backend
  productos = signal<any[]>([]); 
  errorMsg = signal<string | null>(null);
  filtroCategoria = signal<string>('TODO');

  constructor() {
    this.cargarProductos();
  }

  cargarProductos(categoria?: string) {
    this.apiService.getProductos(categoria).subscribe({
      next: (respuesta: any) => {
        const data = respuesta.data ? respuesta.data : respuesta;
        this.productos.set(Array.isArray(data) ? data : []);
      },
      error: (err) => {
        this.errorMsg.set(err.message);
      }
    });
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroCategoria.set(nuevoFiltro);
    this.cargarProductos(nuevoFiltro);
  }

  manejarAgregado(productoSeleccionado: any) {
    const token = localStorage.getItem('token_cafeteria');
    if (token) {
      this.cartService.agregarProducto(productoSeleccionado);
    } else {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
    }
  }
}