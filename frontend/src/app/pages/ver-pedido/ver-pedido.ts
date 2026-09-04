import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.js';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-ver-pedido',
  standalone: true,
  imports: [ CommonModule, RouterLink],
  templateUrl: './ver-pedido.html',
  styleUrl: './ver-pedido.scss',
})
export class VerPedidoComponent {
  cartService = inject(CartService);
  private apiService = inject(ApiService);
  private router = inject(Router);

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
    const usuarioId = localStorage.getItem('usuario_id') || '1'; // Ajusta según cómo guardes el ID en login

  const pedidoPayload = {
    usuario: usuarioId,
    metodo_pago: "6748ac98-6103-4965-a17d-6b3fff777eea", // ID del método de pago por defecto - tarjeta
    direccion_envio: 'Retiro en sucursal',
    fecha_pedido: new Date(),
    fecha_pago: new Date(),
    estado_pago: 'Aprobado',
    costo_total: this.cartService.precioTotal(),
    items: this.cartService.items().map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad
    }))
  };

  this.apiService.crearPedido(pedidoPayload).subscribe({
    next: (res: any) => {
      alert('¡Pedido confirmado con éxito!');
      this.cartService.limpiarCarrito();
      this.router.navigate(['/mis-pedidos']);
    },
    error: (err) => {
      console.error('Error completo:', err);
      console.error('Status HTTP:', err.status);
      console.error('Mensaje del Backend:', err.error);
      alert('Ocurrió un error al procesar tu pedido. Revisa la consola.');
}
  });
}
}
