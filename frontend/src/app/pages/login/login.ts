import { Component, signal, inject } from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  vistaLogin = signal<boolean>(true);
  email = signal<string>('');
  password = signal<string>('');
  mensajeError = signal<string | null>(null);

  toggleVista() {
    this.vistaLogin.set(!this.vistaLogin());
  }

  iniciarSesion() {
    if (!this.email() || !this.password()) {
      this.mensajeError.set('Por favor, completa todos los campos.');
      return;
    }

    this.apiService.obtenerUsuarios().subscribe({
      next: (respuesta: any) => {
        const listaUsuarios = respuesta.data ? respuesta.data : respuesta;

        console.log('Usuarios en la BD: ', listaUsuarios);
        console.log('Email ingresado: ', this.email());
        console.log('Password ingresado: ', this.password());

        const usuarioValido = listaUsuarios.find(
          (u: any) => u.email === this.email() && u.password === this.password()
        );

        if (usuarioValido) {
          this.authService.login(usuarioValido.nombre);
          this.router.navigate(['/inicio']);
          
          this.router.navigate(['/inicio']);
        } else {
          this.mensajeError.set('Credenciales incorrectas');
        }
      },
      error: (err) => {
        this.mensajeError.set('Error al conectar con la base de datos.');
      }
    });
  }
}
