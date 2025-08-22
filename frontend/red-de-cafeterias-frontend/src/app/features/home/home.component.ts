import { Component } from '@angular/core';
import { CardsComponent } from "../../shared/cards/cards.component";
import { NgFor } from '@angular/common';
import { BotonesComponent } from "../../shared/botones/botones.component";

@Component({
  selector: 'app-home',
  imports: [CardsComponent, NgFor, BotonesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {   // este es el componente padre de cards
  
  cards = [ // define el array de objetos que se utilizará para mostrar las cards
    { texto: 'Encontrá cafeterías cerca tuyo', icon: '🔍' },  
    { texto: 'No te pierdas ningún evento', icon: '📅' },
    { texto: 'Leé y escribí reseñas reales', icon: '⭐' },
    { texto: 'Guardá tus lugares favoritos', icon: '📌' }
  ];

}
