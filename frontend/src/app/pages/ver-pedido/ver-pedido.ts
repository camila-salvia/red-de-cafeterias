import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.js';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-ver-pedido',
  standalone: true,
  imports: [ CommonModule, RouterLink, DatePipe],
  templateUrl: './ver-pedido.html',
  styleUrl: './ver-pedido.scss',
})
export class VerPedidoComponent {
  cartService = inject(CartService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  // pedido recien confirmado
pedidoReciente = signal<any | null>(null);

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

  confirmarPedido() {
    if (this.cartService.items().length === 0) return;
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) {
      alert('Debes iniciar sesión.');
      this.router.navigate(['/login']);
      return;
    }

    // para el comprobante
  const itemsComprados = [...this.cartService.items()];

  const pedidoPayload = {
    usuario: usuarioId,
    metodo_pago: "6748ac98-6103-4965-a17d-6b3fff777eea", // por defecto - tarjeta
    direccion_envio: 'Retiro en sucursal', // por defecto
    fecha_pedido: new Date(),
    fecha_pago: new Date(),
    estado_pago: 'Aprobado', // checkear
    costo_total: this.cartService.precioTotal(),
    items: itemsComprados.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      }))
  };

  this.apiService.crearPedido(pedidoPayload).subscribe({
    next: (res: any) => {
      const nuevoPedido = res.data ? res.data : res;
      this.pedidoReciente.set({
        ...nuevoPedido,
        itemsVisuales: itemsComprados
      });
      this.cartService.limpiarCarrito();
    },
    error: (err) => {
      console.error('Error al crear pedido', err);
      alert('Ocurrió un error al procesar tu pedido.');
    }
  });
}
volverAlMenu() {
  this.pedidoReciente.set(null);
  this.router.navigate(['/']);
}
}
