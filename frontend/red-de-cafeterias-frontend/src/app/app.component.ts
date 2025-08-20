// Este es el componente angular de nivel superior de la aplicación
// En el .ts se escribe el código fuente que describe el componente

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/login/login.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'red-de-cafeterias';
}
