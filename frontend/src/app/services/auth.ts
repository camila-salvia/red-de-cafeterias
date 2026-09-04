import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token_cafeteria'));
  usuarioActual = signal<string | null>(localStorage.getItem('nombre_usuario'));
  usuarioIdActual = signal<string | null>(localStorage.getItem('usuario_id'));
  
  login(nombre: string , id: string | number) {
    localStorage.setItem('token_cafeteria', 'sesion-activa');
    localStorage.setItem('nombre_usuario', nombre);
    localStorage.setItem('usuario_id', String(id));

    this.isLoggedIn.set(true);
    this.usuarioActual.set(nombre);
    this.usuarioIdActual.set(String(id));
  }

  logout() {
    localStorage.removeItem('token_cafeteria');
    localStorage.removeItem('nombre_usuario');
    localStorage.removeItem('usuario_id');

    this.isLoggedIn.set(false);
    this.usuarioActual.set(null);
    this.usuarioIdActual.set(null);
  }
}