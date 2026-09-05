import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ver-pedido',
  standalone: true,
  imports: [ CommonModule, RouterLink, FormsModule ],
  templateUrl: './ver-pedido.html',
  styleUrl: './ver-pedido.scss',
})

export class VerPedidoComponent {
  cartService = inject(CartService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  // pedido recien confirmado
  pedidoReciente = signal<any | null>(null);
  metodosPago = signal<any[]>([]);
  metodoSeleccionado = signal<string | null>(null);

  constructor() {
    this.cargarMetodosPago();
  }

  incrementar(id?: number | string) {
    if (id !== undefined) {
      this.cartService.cambiarCantidad(id, 1);
    }
  }

  decrementar(id?: number | string) {
    if (id !== undefined) {
      this.cartService.cambiarCantidad(id, -1);
    }
  }

  eliminar(id?: number | string) {
    if (id !== undefined) {
      this.cartService.eliminarProducto(id);
    }
  }

  cargarMetodosPago() {
    this.apiService.getMetodosPago().subscribe({
      next: (res: any) => this.metodosPago.set(res.data),
      error: (err) => console.error('Error al cargar métodos de pago', err)
    });
  }

  async confirmarPedido() {
    // validar carrito vacio
    if (this.cartService.items().length === 0) return;
    // validar usuario logueado
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) {
      alert('Debes iniciar sesión.');
      this.router.navigate(['/login']);
      return;
    }
    // validar metodo de pago seleccionado
    if (!this.metodoSeleccionado()) {
      alert('Debes seleccionar un método de pago.');
      return;
    }
    // confirmacion visual y procesamiento
    if (confirm('¿Deseas confirmar tu pedido?')) {
      try {
        const fechaActual = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        const itemsComprados = [...this.cartService.items()];
        const nuevoPedido = {
          fecha_pedido: fechaActual,
          costo_total: this.cartService.precioTotal(),
          direccion_envio: 'Retiro en sucursal', // valor por defecto
          fecha_pago: fechaActual,
          estado_pago: 'Pendiente',
          usuario: usuarioId,
          metodo_pago: this.metodoSeleccionado(),
          items: itemsComprados.map(item => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio
          }))
        };
        //enviar pedido a base de datos
        const resPedido: any = await firstValueFrom(this.apiService.crearPedido(nuevoPedido));
        const pedidoGenerado = resPedido.data;
        // limpiar carrito y mostrar confirmacion
        this.cartService.limpiarCarrito();
        // asignar datos al signal para mostrar en la vista de confirmacion
        this.pedidoReciente.set({
          id: pedidoGenerado.id,
          estado_pago: pedidoGenerado.estado_pago,
          costo_total: pedidoGenerado.costo_total,
          itemsVisuales: itemsComprados
        });
      } catch (error) {
        console.error('Error al procesas pedido:', error);
        alert('Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
      }
    }
  }

  volverAlMenu() {
    this.pedidoReciente.set(null);
    this.router.navigate(['/inicio ']);
  }
}