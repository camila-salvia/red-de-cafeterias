import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-boton',
  imports: [],
  templateUrl: './boton.html',
  styleUrl: './boton.scss',
})
export class BotonComponent {
  @Input() texto: string = '';
}
