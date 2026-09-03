import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.interface';
import { ItemCarrito } from '../models/item-carrito.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<ItemCarrito[]>([]);
  // Cálculos automáticos derivados con computed()
  cantidadTotal = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );
  precioTotal = computed(() =>
    this.items().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0)
  );
  agregarProducto(producto: Producto): void {
    const actuales = this.items();
    const indice = actuales.findIndex(item => item.producto.id === producto.id);

    if (indice !== -1) {
      // Si ya está en el carrito, sumamos 1 a la cantidad
      const actualizados = [...actuales];
      actualizados[indice] = {
        ...actualizados[indice],
        cantidad: actualizados[indice].cantidad + 1
      };
      this.items.set(actualizados);
    } else {
      // Si es un producto nuevo en el carrito
      this.items.set([...actuales, { producto, cantidad: 1 }]);
    }
  }

  eliminarProducto(productoId: number | string): void {
    this.items.set(this.items().filter(item => item.producto.id !== productoId));
  }

  cambiarCantidad(productoId: number | string, delta: number): void {
    const actualizados = this.items()
      .map(item => {
        if (item.producto.id === productoId) {
          const nuevaCantidad = item.cantidad + delta;
          return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
        }
        return item;
      })
      .filter((item): item is ItemCarrito => item !== null);

    this.items.set(actualizados);
  }

  limpiarCarrito(): void {
    this.items.set([]);
  }
}