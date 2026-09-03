import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.js';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-ver-pedido',
  standalone: true,
  imports: [ CommonModule, RouterLink],
  templateUrl: './ver-pedido.html',
  styleUrl: './ver-pedido.scss',
})
export class VerPedidoComponent {
  cartService = inject(CartService);
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

    // Aquí más adelante llamaremos al backend para guardar en la base de datos
    console.log('Enviando pedido al backend...', this.cartService.items());
    alert('¡Pedido confirmado con éxito!');
    
    this.cartService.limpiarCarrito();
    this.router.navigate(['/mis-pedidos']);
  }
}
