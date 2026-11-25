import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Producto } from '../models/producto.interface';
import { ComentarioApi, ComentarioResponse, ComentariosResponse } from '../models/comentario.interface';
import { environment } from '../../environments/environment';

export interface PedidoRequest {
  direccion_envio: string;
  metodo_pago: string;
  items: Array<{ productoId: string; cantidad: number }>;
}

export interface PedidoResponse {
  data: {
    id: string;
    estado_pago: string;
    costo_total: number;
  };
}

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private http = inject(HttpClient);
  // Base común: 'http://localhost:3000/api'
  private apiUrl = environment.apiUrl;
  // El header Authorization lo agrega authInterceptor en todas las llamadas a la API.

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

  getProductosAdmin(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/producto/admin/productos`)
      .pipe(catchError(this.manejarError));
  }

  crearProducto(producto: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, producto)
      .pipe(catchError(this.manejarError));
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producto/${id}`)
      .pipe(catchError(this.manejarError));
  }

  actualizarProducto(id: string, producto: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}`, producto)
      .pipe(catchError(this.manejarError));
  }

  cambiarEstadoProducto(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/producto/${id}/estado`, {})
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

  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categoria/${id}`)
      .pipe(catchError(this.manejarError));
  }

// usuario
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario`)
    .pipe(catchError(this.manejarError));
  }

  crearUsuario(nuevoUsuario: {
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
    email: string;
    password: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/usuario`, nuevoUsuario)
      .pipe(catchError(this.manejarError));
  }

  // pedido
  crearPedido(pedidoData: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/pedido`, pedidoData)
      .pipe(catchError(this.manejarError));
  }

  crearDetallePedido(detalleData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/detalle-pedido`, detalleData)
      .pipe(catchError(this.manejarError));
  }

  obtenerMisPedidos(usuarioId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido/usuario/${usuarioId}`)
      .pipe(catchError(this.manejarError));
  }

  obtenerPedidosClientes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido`)
      .pipe(catchError(this.manejarError));
  }

  obtenerPedido(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido/${id}`)
      .pipe(catchError(this.manejarError));
  }

  confirmarPedido(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/pedido/${id}/confirmar`, {})
      .pipe(catchError(this.manejarError));
  }

  cancelarPedido(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/pedido/${id}/cancelar`, {})
      .pipe(catchError(this.manejarError));
  }

  // comentario
  getComentarios(): Observable<ComentariosResponse> {
    return this.http.get<ComentariosResponse>(`${this.apiUrl}/comentario`)
      .pipe(catchError(this.manejarError));
  }

  // El usuario NO se envía: el backend lo toma del token
  crearComentario(comentario: Pick<ComentarioApi, 'puntuacion' | 'contenido'>): Observable<ComentarioResponse> {
    return this.http.post<ComentarioResponse>(`${this.apiUrl}/comentario`, comentario)
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

  // pago
  // solo métodos activos: los que se ofrecen al armar un pedido nuevo
  getMetodosPago(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metodo-pago`)
      .pipe(catchError(this.manejarError));
  }

  // todos (activos e inactivos): para la pantalla de administración
  getMetodosPagoAdmin(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metodo-pago/admin/metodos`)
      .pipe(catchError(this.manejarError));
  }

  crearMetodoPago(metodo: { nombre: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/metodo-pago`, metodo)
      .pipe(catchError(this.manejarError));
  }

  cambiarEstadoMetodoPago(id: string, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/metodo-pago/${id}`, { activo })
      .pipe(catchError(this.manejarError));
  }

  crearPreferenciaPago(pedidoId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pago/preferencia/${pedidoId}`, {})
      .pipe(catchError(this.manejarError));
}
}