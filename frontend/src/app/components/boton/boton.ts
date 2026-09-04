import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boton',
  imports: [CommonModule],
  templateUrl: './boton.html',
  styleUrl: './boton.scss',
})
export class BotonComponent {
  @Input() texto: string = '';
  @Input() variante: 'primario' | 'logout' = 'primario';
  @Output() onClick = new EventEmitter<void>();
}
