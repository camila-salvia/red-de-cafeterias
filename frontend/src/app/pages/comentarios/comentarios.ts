import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comentario } from '../../models/comentario.interface';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.scss']
})
export class ComentariosComponent {
  // Lista de reseñas iniciales para mostrar en la página
  resenas = signal<Comentario[]>([
    { id: 1, usuario: 'María G.', puntuacion: 5, contenido: '¡El mejor café de la ciudad!', fecha_publicacion: new Date('2026-08-30') },
    { id: 2, usuario: 'Carlos T.', puntuacion: 3, contenido: '', fecha_publicacion: new Date('2026-09-01') }
  ]);

  sesionIniciada = signal<boolean>(!!localStorage.getItem('token_cafeteria'));
  puntajeSeleccionado = signal<number>(0);
  textoComentario = signal<string>('');
  mostrarPopup = signal<boolean>(false);
  mensajeError = signal<string | null>(null);

  filtroEstrellas = signal<number>(0); // 0 = todos
  ordenReciente = signal<boolean>(true); // true = mas recientes primero

  resenasFiltradas = computed(() => {
    let lista = this.resenas();
    if (this.filtroEstrellas() > 0) {
      lista = lista.filter(r => r.puntuacion === this.filtroEstrellas());
    }
    return lista.sort((a, b) => {
      const tiempoA = a.fecha_publicacion.getTime();
      const tiempoB = b.fecha_publicacion.getTime();
      return this.ordenReciente() ? tiempoB - tiempoA : tiempoA - tiempoB;
    });
  });

  marcarEstrella(valor: number) {
    this.puntajeSeleccionado.set(valor);
    this.mensajeError.set(null);
  }

  //Simulador IA para moderacion (modificar)
  moderarIA(texto: string): boolean {
    const groserias = ['malo', 'asqueroso', 'horrible'];
    return !groserias.some(palabra => texto.toLowerCase().includes(palabra));
  }

  enviarResena() {
    if (this.puntajeSeleccionado() === 0) {
      this.mensajeError.set('Debes seleccionar al menos una estrella para calificar.');
      return;
    }

    if (this.textoComentario().trim().length > 0 && !this.moderarIA(this.textoComentario())) {
      this.mensajeError.set('Tu comentario contiene palabras que infringen nuestras normas de convivencia.');
      return;
    }

    const nuevoComentario: Comentario = {
      id: Date.now(),
      usuario: 'Tú (Usuario Actual)',
      puntuacion: this.puntajeSeleccionado(),
      contenido: this.textoComentario(),
      fecha_publicacion: new Date()
    };

    this.resenas.update(lista => [nuevoComentario, ...lista]);
    this.puntajeSeleccionado.set(0);
    this.textoComentario.set('');
    this.mensajeError.set(null);
    this.mostrarPopup.set(true);
    setTimeout(() => this.mostrarPopup.set(false), 3000);
  }
}