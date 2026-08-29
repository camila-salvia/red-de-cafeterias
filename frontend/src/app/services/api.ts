import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Producto } from '../models/producto.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  //Angular usará LOCALHOST o la URL de PRODUCCION automaticamente
  private apiUrl = environment.apiUrl;

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl)
      .pipe(catchError(this.manejarError));
  }

  crearProducto(producto: Producto): Observable<any> {
    return this.http.post(this.apiUrl, producto)
      .pipe(catchError(this.manejarError));
  }

  private manejarError(error: HttpErrorResponse) {
    let mensajeAmigable = 'Ocurrió un error inesperado al procesar tu solicitud.';
    if (error.status === 404) mensajeAmigable = 'No pudimos encontrar el recurso solicitado.';
    if (error.status === 500) mensajeAmigable = 'Problema en el servidor. Intenta más tarde.';
    return throwError(() => new Error(mensajeAmigable));
  }
}



