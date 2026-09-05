import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Producto } from '../models/producto.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private http = inject(HttpClient);
  // Base común: 'http://localhost:3000/api'
  private apiUrl = environment.apiUrl;

  // autenticación
  login(credenciales: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuario/login`, credenciales);
  }

  // producto
  getProductos(categoria?: string): Observable<any> {
    let params = new HttpParams();
    if (categoria && categoria !== 'TODO') {
      params = params.set('categoria', categoria.toLowerCase());
    }
    return this.http.get<any>(`${this.apiUrl}/producto`, { params })
      .pipe(catchError(this.manejarError));
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, producto)
      .pipe(catchError(this.manejarError));
  }

// categoría
getCategorias(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categoria`)
      .pipe(catchError(this.manejarError));
  }

  crearCategoria(categoria: { nombre: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categoria`, categoria)
      .pipe(catchError(this.manejarError));
  }

// usuario
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario`)
    .pipe(catchError(this.manejarError));
  }

  crearUsuario(nuevoUsuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuario`, nuevoUsuario)
      .pipe(catchError(this.manejarError));
  }

  // pedido
  crearPedido(pedidoData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pedido`, pedidoData)
      .pipe(catchError(this.manejarError));
  }

  obtenerMisPedidos(usuarioId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido/usuario/${usuarioId}`)
      .pipe(catchError(this.manejarError));
  }

  // manejo de errores
    private manejarError(error: HttpErrorResponse) {
    if (error.error) {
      return throwError(() => error);
    }
    let mensajeAmigable = 'Ocurrió un error inesperado al procesar tu solicitud.';
    if (error.status === 404) mensajeAmigable = 'No pudimos encontrar el recurso solicitado.';
    if (error.status === 500) mensajeAmigable = 'Problema en el servidor. Intenta más tarde.';
    
    return throwError(() => new Error(mensajeAmigable));
  }
}



