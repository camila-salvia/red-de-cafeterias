import { Component, signal } from '@angular/core';
import {CommonModule} from '@angular/common';
//import { FormularioLoginComponent } from '../../components/formulario-login/formulario-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  vistaLogin = signal<boolean>(true);

  toggleVista() {
    this.vistaLogin.set(!this.vistaLogin());
  }
}
