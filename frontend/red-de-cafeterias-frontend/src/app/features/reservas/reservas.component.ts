import { Component } from '@angular/core';
import { FormularioReservaComponent } from "./formulario-reserva/formulario-reserva.component";

@Component({
  selector: 'app-reservas',
  imports: [FormularioReservaComponent],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent {

}
