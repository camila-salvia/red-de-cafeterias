import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cards',
  imports: [],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {
  @Input() texto: string = ''; // texto que se mostrará en la card y viene del componente padre (HomeComponent)
  @Input() icon: string = ''; 
}
