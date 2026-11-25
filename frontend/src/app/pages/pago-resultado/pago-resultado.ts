import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

// Pantalla a la que vuelve el usuario desde Mercado Pago (back_urls).
// No confía en los parámetros de la URL para decidir si se pagó: consulta el pedido
// al backend, cuyo estado lo actualiza el webhook.
@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './pago-resultado.html',
  styleUrl: './pago-resultado.scss',
})
export class PagoResultadoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  pedido = signal<any | null>(null);
  error = signal<string | null>(null);
  cargando = signal(true);

  private intentos = 0;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    // Mercado Pago agrega external_reference (el id del pedido) a la URL de retorno
    const pedidoId = this.route.snapshot.queryParamMap.get('external_reference');
    if (!pedidoId) {
      this.error.set('No pudimos identificar el pedido. Revisá “Mis pedidos”.');
      this.cargando.set(false);
      return;
    }
    this.consultar(pedidoId);
  }

  private consultar(pedidoId: string) {
    this.api.obtenerPedido(pedidoId).subscribe({
      next: (res) => {
        const p = res.data;
        this.pedido.set(p);
        // El webhook puede tardar unos segundos: reintentamos mientras siga pendiente
        if (p.estado_pago === 'Pendiente' && ++this.intentos < 6) {
          this.timer = setTimeout(() => this.consultar(pedidoId), 3000);
        } else {
          this.cargando.set(false);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No pudimos consultar tu pedido.');
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}