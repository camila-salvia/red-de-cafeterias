import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ApiService, PedidoRequest } from '../../services/api';
import { ItemCarrito } from '../../models/item-carrito.interface';
import { firstValueFrom } from 'rxjs';

interface MetodoPago {
  id: string;
  nombre: string;
}

interface PedidoReciente {
  id: string;
  estado_pago: string;
  costo_total: number;
  itemsVisuales: ItemCarrito[];
}

@Component({
  selector: 'app-ver-pedido',
  standalone: true,
  imports: [ CommonModule, RouterLink, FormsModule ],
  templateUrl: './ver-pedido.html',
  styleUrl: './ver-pedido.scss',
})

export class VerPedidoComponent {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  // pedido recien confirmado
  pedidoReciente = signal<PedidoReciente | null>(null);
  metodosPago = signal<MetodoPago[]>([]);
  metodoSeleccionado = signal<string | null>(null);
  mensajeError = signal<string | null>(null);
  mensajeErrorMetodosPago = signal<string | null>(null);
  cargandoPedido = signal(false);

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
    this.mensajeErrorMetodosPago.set(null);
    this.apiService.getMetodosPago().subscribe({
      next: (res: { data?: MetodoPago[] }) => {
        if (!Array.isArray(res?.data) || res.data.length === 0) {
          this.metodosPago.set([]);
          this.mensajeErrorMetodosPago.set('No hay métodos de pago disponibles. Intentá nuevamente más tarde.');
          return;
        }
        this.metodosPago.set(res.data);
      },
      error: () => {
        this.mensajeErrorMetodosPago.set('No pudimos cargar los métodos de pago. Revisá tu conexión e intentá de nuevo.');
      }
    });
  }

  async confirmarPedido() {
    if (this.cargandoPedido()) return;
    this.mensajeError.set(null);

    const itemsActuales = this.cartService.items();
    if (itemsActuales.length === 0) return;

    const usuarioId = this.authService.usuarioIdActual();
    if (!usuarioId) {
      this.authService.forzarLogin('Iniciá sesión para continuar.', true);
      return;
    }

    const metodoPagoId = this.metodoSeleccionado();
    if (!metodoPagoId) {
      this.mensajeError.set('Seleccioná un método de pago para continuar.');
      return;
    }

    const itemsPedido: PedidoRequest['items'] = [];
    for (const item of itemsActuales) {
      const productoId = item.producto.id;
      if (!productoId) {
        this.mensajeError.set('Hay un producto sin identificador en el carrito. Quitalo e intentá nuevamente.');
        return;
      }
      itemsPedido.push({ productoId, cantidad: item.cantidad });
    }

    if (!confirm('¿Deseas confirmar tu pedido?')) return;

    const itemsComprados = [...itemsActuales];
    this.cargandoPedido.set(true);
    try {
      const pedido: PedidoRequest = {
        direccion_envio: 'Retiro en sucursal',
        metodo_pago: metodoPagoId,
        items: itemsPedido,
      };
      const respuesta = await firstValueFrom(this.apiService.crearPedido(pedido));
      const pedidoGenerado = respuesta?.data;

      if (!pedidoGenerado?.id) {
        this.mensajeError.set('El servidor no confirmó el pedido. Revisá “Mis pedidos” antes de intentarlo nuevamente.');
        return;
      }

      // El pedido ya existe en el servidor: el carrito se vacía en cualquier caso
      this.cartService.limpiarCarrito();

      // Si eligió Mercado Pago, lo mandamos a pagar
      if (this.esMercadoPago(metodoPagoId)) {
        try {
          const pref = await firstValueFrom(this.apiService.crearPreferenciaPago(pedidoGenerado.id));
          const urlPago = pref?.data?.init_point;
          if (!urlPago) throw new Error('El servidor no devolvió la URL de pago.');
          window.location.href = urlPago;
          return;
        } catch {
          this.mensajeError.set('Tu pedido quedó registrado como pendiente, pero no pudimos iniciar el pago con Mercado Pago.');
          // se continúa para mostrar el pedido generado
        }
      }

      this.pedidoReciente.set({
        id: pedidoGenerado.id,
        estado_pago: pedidoGenerado.estado_pago,
        costo_total: pedidoGenerado.costo_total,
        itemsVisuales: itemsComprados,
      });
    } catch (error: unknown) {
      this.mensajeError.set(this.mensajeDeErrorPedido(error));
    } finally {
      this.cargandoPedido.set(false);
    }
  }

  volverAlMenu() {
    this.pedidoReciente.set(null);
    this.router.navigate(['/']);
  }

  private esMercadoPago(metodoPagoId: string): boolean {
    const metodo = this.metodosPago().find(m => m.id === metodoPagoId);
    return !!metodo && metodo.nombre.toLowerCase().includes('mercado');
  }

  private mensajeDeErrorPedido(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'No pudimos conectar con el servidor. Tu carrito se conservó; intentá nuevamente.';
      if (error.status === 401) return 'Tu sesión venció. Iniciá sesión nuevamente; tu carrito se conservó.';
      if (error.status >= 500) return 'No pudimos procesar el pedido por un problema del servidor. Tu carrito se conservó.';

      const cuerpo = error.error as { message?: unknown; errores?: unknown } | null;
      if (error.status === 400 && Array.isArray(cuerpo?.errores) && cuerpo.errores.every(item => typeof item === 'string')) {
        return cuerpo.errores.join(' ');
      }
      if (typeof cuerpo?.message === 'string') return cuerpo.message;
    }

    if (error instanceof Error && error.message) return error.message;
    return 'No pudimos procesar el pedido. Tu carrito se conservó; intentá nuevamente.';
  }
}