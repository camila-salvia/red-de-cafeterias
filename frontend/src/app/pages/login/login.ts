import { Component } from '@angular/core';
import { FormularioLoginComponent } from '../../components/formulario-login/formulario-login';

@Component({
  selector: 'app-login',
  imports: [FormularioLoginComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {}
