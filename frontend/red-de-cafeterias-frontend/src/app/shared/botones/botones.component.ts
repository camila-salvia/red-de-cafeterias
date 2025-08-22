import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-botones',
  imports: [],
  templateUrl: './botones.component.html',
  styleUrl: './botones.component.css'
})
export class BotonesComponent {
  @Input() texto: string = '';
}
