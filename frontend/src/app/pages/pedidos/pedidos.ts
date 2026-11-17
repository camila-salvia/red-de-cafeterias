import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class Pedidos {
  private apiService = inject(ApiService);

  pedidos = signal<any[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);
  pedidoConfirmandoId = signal<string | null>(null);
  estadoSeleccionado = signal('Todos');
  estadosPedidos = ['Pendiente', 'Confirmado', 'Cancelado'];
  pedidosFiltrados = computed(() => {
    const estado = this.estadoSeleccionado();
    return estado === 'Todos'
      ? this.pedidos()
      : this.pedidos().filter(pedido => pedido.estado_pago === estado);
  });

  constructor() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.error.set(null);

    this.apiService.obtenerPedidosClientes().subscribe({
      next: (respuesta: any) => {
        const lista = respuesta.data ?? respuesta;
        this.pedidos.set(Array.isArray(lista) ? lista : []);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(error.error?.message || 'No se pudieron cargar los pedidos.');
        this.cargando.set(false);
      },
    });
  }

  confirmarPedido(pedido: any) {
    if (pedido.estado_pago !== 'Pendiente' || this.pedidoConfirmandoId()) return;

    this.error.set(null);
    this.mensaje.set(null);
    this.pedidoConfirmandoId.set(pedido.id);

    this.apiService.confirmarPedido(pedido.id).subscribe({
      next: (respuesta: any) => {
        const estado = respuesta.data?.estado_pago ?? 'Confirmado';
        this.pedidos.update(pedidos =>
          pedidos.map(actual => actual.id === pedido.id
            ? { ...actual, estado_pago: estado }
            : actual)
        );
        this.mensaje.set('Pedido confirmado correctamente.');
        this.pedidoConfirmandoId.set(null);
      },
      error: (error) => {
        this.error.set(error.error?.message || 'No se pudo confirmar el pedido.');
        this.pedidoConfirmandoId.set(null);
      },
    });
  }
}
