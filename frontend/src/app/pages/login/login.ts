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
  nombre = signal<string>('');
  apellido = signal<string>('');
  telefono = signal<string>('');
  direccion = signal<string>('');
  mensajeError = signal<string | null>(null);
  mensajeRegistro = signal<string | null>(null);
  cargando = signal<boolean>(false);
  // Aviso previo al login: "Tu sesión venció", "Iniciá sesión para continuar", etc.
  mensajeSesion = this.authService.mensajeSesion.asReadonly();

  toggleVista() {
    this.vistaLogin.set(!this.vistaLogin());
    this.limpiarError();
  }

  limpiarError() {
    this.mensajeError.set(null);
    this.mensajeRegistro.set(null);
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

  crearCuenta() {
    if (this.cargando()) return;

    const nombre = this.nombre().trim();
    const apellido = this.apellido().trim();
    const telefono = this.telefono().trim();
    const direccion = this.direccion().trim();
    const email = this.email().trim();
    const password = this.password();

    if (!nombre || !apellido || !telefono || !direccion || !email || !password) {
      this.mensajeError.set('Por favor, completa todos los campos.');
      return;
    }
    if (nombre.length < 2 || apellido.length < 2) {
      this.mensajeError.set('El nombre y el apellido deben tener al menos 2 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.mensajeError.set('Ingresá un email válido.');
      return;
    }
    if (password.length < 6) {
      this.mensajeError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/^[0-9]{7,15}$/.test(telefono)) {
      this.mensajeError.set('El teléfono debe tener entre 7 y 15 dígitos.');
      return;
    }
    if (direccion.length < 5) {
      this.mensajeError.set('La dirección debe tener al menos 5 caracteres.');
      return;
    }

    this.mensajeError.set(null);
    this.mensajeRegistro.set(null);
    this.cargando.set(true);

    this.apiService.crearUsuario({
      nombre,
      apellido,
      telefono,
      direccion,
      email,
      password,
    }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.nombre.set('');
        this.apellido.set('');
        this.telefono.set('');
        this.direccion.set('');
        this.email.set('');
        this.password.set('');
        this.vistaLogin.set(true);
        this.mensajeRegistro.set('Cuenta creada con éxito. Ya podés iniciar sesión.');
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.mensajeError.set(this.mensajeDeErrorRegistro(err));
      },
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

  private mensajeDeErrorRegistro(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 409) return 'Ese email ya se encuentra registrado.';
      if (err.status === 400) {
        const errores = err.error?.errores;
        if (Array.isArray(errores) && errores.every(e => typeof e === 'string')) {
          return errores.join(' ');
        }
        if (typeof err.error?.message === 'string') return err.error.message;
      }
      if (err.status === 0) return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
      if (err.status >= 500) return 'Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.';
    }
    return 'No pudimos crear la cuenta. Intentá nuevamente.';
  }
}