import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
// Importamos apuntando exactamente a tu archivo 'api.ts'
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './inicio.html', 
  styleUrl: './inicio.scss',
})

export class InicioComponent {
  private apiService = inject(ApiService);
  
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
}