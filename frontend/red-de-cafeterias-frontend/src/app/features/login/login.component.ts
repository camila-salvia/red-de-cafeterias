import { Component } from '@angular/core';
import { FormularioLoginComponent } from "./formulario-login/formulario-login.component";


@Component({
  selector: 'app-login',
  imports: [FormularioLoginComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
