// app.component.ts usando Signals (Lo más moderno en Angular 21)
import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe], // Solo importamos lo que usamos
  template: `
    <div>
      <h1>Datos desde el Backend:</h1>
      <!-- Los Signals se leen poniéndoles paréntesis al final () -->
      <pre>{{ datosDelServidor() | json }}</pre> 
    </div>
  `
})
export class AppComponent {
  private apiService = inject(ApiService);
  
  // Creamos un Signal vacío
  datosDelServidor = signal<any>(null); 

  constructor() {
    this.apiService.obtenerDatos().subscribe(respuesta => {
      // En lugar de this.datos = respuesta, actualizamos el Signal así:
      this.datosDelServidor.set(respuesta);
    });
  }
}