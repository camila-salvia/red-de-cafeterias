// Este es el componente angular de nivel superior de la aplicación
// En el .ts se escribe el código fuente que describe el componente

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "./features/home/home.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, 
    HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'red-de-cafeterias';
}
