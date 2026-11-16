import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss',
})
export class MisPedidosComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  pedidos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);
  pedidoCancelandoId = signal<string | null>(null);
  estadoSeleccionado = signal<string>('Todos');
  estadosPedidos = computed(() =>
    [...new Set(this.pedidos()
      .map(pedido => pedido.estado_pago)
      .filter((estado): estado is string => typeof estado === 'string' && estado.length > 0))]
  );
  pedidosFiltrados = computed(() => {
    const estado = this.estadoSeleccionado();
    return estado === 'Todos'
      ? this.pedidos()
      : this.pedidos().filter(pedido => pedido.estado_pago === estado);
  });

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.error.set(null);
    // El id sale del token: el backend solo deja ver los pedidos propios (o a un admin)
    const usuarioId = this.authService.usuarioIdActual();
    if (!usuarioId) {
      this.cargando.set(false);
      return;
    }

    this.apiService.obtenerMisPedidos(usuarioId).subscribe({
      next: (res: any) => {
        const lista = res.data ? res.data : res;
        this.pedidos.set(Array.isArray(lista) ? lista : []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.error.set(err.error?.message || 'No se pudieron cargar tus pedidos.');
        this.cargando.set(false);
      }
    });
  }

  cancelarPedido(pedido: any) {
    if (pedido.estado_pago !== 'Pendiente' || this.pedidoCancelandoId()) return;
    if (!confirm('¿Seguro que deseas cancelar este pedido?')) return;

    this.error.set(null);
    this.mensaje.set(null);
    this.pedidoCancelandoId.set(pedido.id);

    this.apiService.cancelarPedido(pedido.id).subscribe({
      next: (respuesta: any) => {
        const estado = respuesta.data?.estado_pago ?? 'Cancelado';
        this.pedidos.update(pedidos =>
          pedidos.map(actual => actual.id === pedido.id
            ? { ...actual, estado_pago: estado }
            : actual)
        );
        this.mensaje.set('Pedido cancelado correctamente.');
        this.pedidoCancelandoId.set(null);
      },
      error: (error) => {
        this.error.set(error.error?.message || 'No se pudo cancelar el pedido.');
        this.pedidoCancelandoId.set(null);
      },
    });
  }
}
