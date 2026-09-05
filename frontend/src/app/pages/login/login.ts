import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

    this.apiService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (respuesta: any) => {
        if (respuesta.data) {
          this.authService.login(respuesta.data); //Recibe {token, id, nombre, esAdmin}
          this.router.navigate(['/inicio']);
        }
      },
      error: (err) => {
        this.mensajeError.set('Credenciales inválidas');
      }
    });
  }
}
