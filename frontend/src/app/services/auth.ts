import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token_cafeteria'));
  usuarioActual = signal<string | null>(localStorage.getItem('nombre_usuario'));
  // usuarioIdActual = signal<string | null>(localStorage.getItem('usuario_id'));
  esAdmin = signal<boolean>(localStorage.getItem('es_admin') === 'true');
  
login(usuarioData: { id: string; nombre: string; token: string; esAdmin: boolean }) {
    localStorage.setItem('token_cafeteria', usuarioData.token);
    localStorage.setItem('usuario_id', usuarioData.id);
    localStorage.setItem('nombre_usuario', usuarioData.nombre);
    localStorage.setItem('es_admin', String(usuarioData.esAdmin));

    this.isLoggedIn.set(true);
    this.usuarioActual.set(usuarioData.nombre);
    this.esAdmin.set(usuarioData.esAdmin);
  }

  logout() {
    localStorage.removeItem('token_cafeteria');
    localStorage.removeItem('nombre_usuario');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('es_admin');

    this.isLoggedIn.set(false);
    this.usuarioActual.set(null);
    this.esAdmin.set(false);
  }
}