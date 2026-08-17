import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  agregarAlCarrito() {
    this.productoAgregado.emit(this.producto);
  }
}