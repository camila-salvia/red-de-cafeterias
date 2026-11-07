import { Component, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../services/api';
import { AuthService, DatosLogin } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnDestroy {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  vistaLogin = signal<boolean>(true);
  email = signal<string>('');
  password = signal<string>('');
  mensajeError = signal<string | null>(null);
  cargando = signal<boolean>(false);
  // Aviso previo al login: "Tu sesión venció", "Iniciá sesión para continuar", etc.
  mensajeSesion = this.authService.mensajeSesion.asReadonly();

  toggleVista() {
    this.vistaLogin.set(!this.vistaLogin());
    this.limpiarError();
  }

  limpiarError() {
    this.mensajeError.set(null);
  }

  iniciarSesion() {
    if (this.cargando()) return;

    if (!this.email() || !this.password()) {
      this.mensajeError.set('Por favor, completa todos los campos.');
      return;
    }

    this.mensajeError.set(null);
    this.cargando.set(true);

    this.apiService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (respuesta: { data?: DatosLogin }) => {
        this.cargando.set(false);
        if (respuesta?.data?.token) {
          this.authService.login(respuesta.data); // Recibe {token, id, nombre, esAdmin}
          this.router.navigate([this.authService.esAdmin() ? '/admin' : '/']);
        } else {
          this.mensajeError.set('El servidor respondió algo inesperado. Intentá nuevamente.');
        }
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.mensajeError.set(this.mensajeDeError(err));
      }
    });
  }

  ngOnDestroy() {
    // el aviso es solo para esta visita al login
    this.authService.mensajeSesion.set(null);
  }

  // Contrato del backend: 400 faltan datos, 401 credenciales inválidas, 500 error interno.
  // status 0 = el servidor no respondió (caído, sin red o CORS).
  private mensajeDeError(err: unknown): string {
    const status = err instanceof HttpErrorResponse ? err.status : -1;

    if (status === 401) return 'Email o contraseña incorrectos.';
    if (status === 400) return 'Completá tu email y tu contraseña.';
    if (status === 0) return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
    if (status >= 500) return 'Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.';
    return 'No pudimos iniciar sesión. Intentá nuevamente.';
  }
}