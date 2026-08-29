import { Component, inject, signal } from '@angular/core';
// import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
// Importamos apuntando exactamente a tu archivo 'api.ts'
import { ApiService } from '../../services/api'; 
// Importamos componente de la tarjeta para usarlo en HTML
import { TarjetaProductoComponent } from '../../components/tarjeta-producto/tarjeta-producto';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TarjetaProductoComponent],
  templateUrl: './inicio.html', 
  styleUrl: './inicio.scss',
})

export class InicioComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  // Declaramos los Signals
  datosDelServidor = signal<any>(null); 
  errorMsg = signal<string | null>(null);

  constructor() {
    this.apiService.getProductos().subscribe({
      next: (respuesta) => {
        // Guardamos los datos si la petición es exitosa
        this.datosDelServidor.set(respuesta);
      },
      error: (err) => {
        // Guardamos el mensaje amigable si el backend falla
        this.errorMsg.set(err.message);
      }
    });
  }

  manejarAgregado(productoSeleccionado: any) {
    const token = localStorage.getItem('token_cafeteria');
    if(token) {
      console.log('Producto agregado exitoasmente: ', productoSeleccionado);
    } else {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/login']);
    }
  }
}