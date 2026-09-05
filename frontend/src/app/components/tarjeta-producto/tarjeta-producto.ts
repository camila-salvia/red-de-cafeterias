import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.interface';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-producto.html',
  styleUrls: ['./tarjeta-producto.scss']
})

export class TarjetaProductoComponent {
  @Input() producto!: Producto; 
  @Output() productoAgregado = new EventEmitter<Producto>();
  notificacionCarrito = signal<string | null>(null); 

  getBackgroundImage(): string {
    const nombre = (this.producto?.nombre || '').toLowerCase();

    if (nombre.includes('cafe') || nombre.includes('café')) {
      return 'url("/assets/cafe.png")';
    }

    if (nombre.includes('lemon') || nombre.includes('pie')) {
      return 'url("/assets/lemon.jpg")';
    }

    return 'url("/assets/cafe.png")';
  }

  agregarAlCarrito() {
    this.productoAgregado.emit(this.producto);
    this.notificacionCarrito.set(`${this.producto.nombre} agregado al carrito`);
    setTimeout(() => {
      this.notificacionCarrito.set(null);
    }, 3000);
  }
}