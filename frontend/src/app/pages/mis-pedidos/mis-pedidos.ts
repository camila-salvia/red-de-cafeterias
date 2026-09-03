import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss',
})
export class MisPedidosComponent implements OnInit {
  private apiService = inject(ApiService);
  pedidos = signal<any[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    const usuarioId = localStorage.getItem('usuario_id') || 1;

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
