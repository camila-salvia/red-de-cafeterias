import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token_cafeteria'));
  usuarioActual = signal<string | null>(localStorage.getItem('nombre_usuario'));

  login(nombre: string) {
    localStorage.setItem('token_cafeteria', 'sesion-activa');
    localStorage.setItem('nombre_usuario', nombre);
    this.isLoggedIn.set(true);
    this.usuarioActual.set(nombre);
  }

  logout() {
    localStorage.removeItem('token_cafeteria');
    localStorage.removeItem('nombre_usuario');
    this.isLoggedIn.set(false);
    this.usuarioActual.set(null);
  }
}