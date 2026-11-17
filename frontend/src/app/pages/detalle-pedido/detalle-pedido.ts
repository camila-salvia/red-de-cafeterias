import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

interface PedidoDetalle {
  id: string;
  fecha_pedido: string | Date;
  estado_pago: string;
  direccion_envio: string;
  costo_total: number;
  usuario?: {
    nombre?: string;
    apellido?: string;
    email?: string;
  };
  metodo_pago?: {
    nombre?: string;
  };
  detalles?: Array<{
    id?: string;
    cantidad: number;
    precio_unitario: number;
    producto?: {
      id?: string;
      nombre?: string;
    };
  }>;
}

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.scss',
})
export class DetallePedidoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);
  readonly esAdmin = inject(AuthService).esAdmin;

  pedido = signal<PedidoDetalle | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No se indicó qué pedido consultar.');
      this.cargando.set(false);
      return;
    }

    this.apiService.obtenerPedido(id).subscribe({
      next: (res: { data: PedidoDetalle }) => {
        const pedido = res.data;
        if (!pedido) {
          this.error.set('No se pudo cargar el pedido.');
        } else {
          this.pedido.set(pedido);
        }
        this.cargando.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err.error?.message || 'No se pudo cargar el pedido.');
        this.cargando.set(false);
      },
    });
  }
}
