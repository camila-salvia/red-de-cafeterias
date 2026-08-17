import { Component } from '@angular/core';
import { BotonComponent } from '../boton/boton';

@Component({
  selector: 'app-formulario-login',
  imports: [BotonComponent],
  templateUrl: './formulario-login.html',
  styleUrl: './formulario-login.scss',
})
export class FormularioLoginComponent {}