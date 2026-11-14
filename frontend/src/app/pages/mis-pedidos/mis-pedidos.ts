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
    // El id sale del token: el backend solo deja ver los pedidos propios (o a un admin)
    const usuarioId = this.authService.usuarioIdActual();
    if (!usuarioId) {
      this.cargando.set(false);
      return;
    }

    this.apiService.obtenerMisPedidos(usuarioId).subscribe({
      next: (res: any) => {
        const lista = res.data ? res.data : res;
        this.pedidos.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.cargando.set(false);
      }
    });
  }
}
