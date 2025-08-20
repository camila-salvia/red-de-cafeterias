// Este es el componente angular de nivel superior de la aplicación
// En el .ts se escribe el código fuente que describe el componente

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'red-de-cafeterias';
}
