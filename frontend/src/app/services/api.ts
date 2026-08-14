import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //Inyectar herramienta de Angular
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  obtenerDatos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/endpoint`);
  }
}
