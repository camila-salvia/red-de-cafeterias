import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comentario, ComentarioApi } from '../../models/comentario.interface';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.scss']
})
export class ComentariosComponent {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  // Las reseñas vienen de la API (ya no hay datos de ejemplo)
  resenas = signal<Comentario[]>([]);
  cargando = signal<boolean>(true);
  errorCarga = signal<string | null>(null);
  enviando = signal<boolean>(false);

  // se actualiza sola al iniciar o cerrar sesión
  sesionIniciada = this.authService.isLoggedIn;
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
    // copia para no mutar el signal original al ordenar
    return [...lista].sort((a, b) => {
      const tiempoA = a.fecha_publicacion.getTime();
      const tiempoB = b.fecha_publicacion.getTime();
      return this.ordenReciente() ? tiempoB - tiempoA : tiempoA - tiempoB;
    });
  });

  constructor() {
    this.cargarResenas();
  }

  // el JSON trae la fecha como string: la convertimos a Date
  private aComentario(c: ComentarioApi): Comentario {
    return { ...c, fecha_publicacion: new Date(c.fecha_publicacion) };
  }

  cargarResenas() {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.apiService.getComentarios().subscribe({
      next: (res) => {
        this.resenas.set(res.data.map(c => this.aComentario(c)));
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No pudimos cargar las reseñas. Intentá nuevamente más tarde.');
        this.cargando.set(false);
      }
    });
  }

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
    if (this.enviando()) return;

    if (this.puntajeSeleccionado() === 0) {
      this.mensajeError.set('Debes seleccionar al menos una estrella para calificar.');
      return;
    }

    if (this.textoComentario().trim().length > 0 && !this.moderarIA(this.textoComentario())) {
      this.mensajeError.set('Tu comentario contiene palabras que infringen nuestras normas de convivencia.');
      return;
    }

    this.enviando.set(true);

    // No se envía usuario ni fecha: el servidor los decide (usuario desde el token)
    this.apiService.crearComentario({
      puntuacion: this.puntajeSeleccionado(),
      contenido: this.textoComentario().trim()
    }).subscribe({
      next: (res) => {
        const creado = this.aComentario(res.data);
        this.resenas.update(lista => [creado, ...lista]);
        this.puntajeSeleccionado.set(0);
        this.textoComentario.set('');
        this.mensajeError.set(null);
        this.enviando.set(false);
        this.mostrarPopup.set(true);
        setTimeout(() => this.mostrarPopup.set(false), 3000);
      },
      error: (err) => {
        // 401 lo maneja el interceptor (redirige a login). Acá mostramos el resto.
        const errores: string[] | undefined = err?.error?.errores;
        this.mensajeError.set(
          errores?.length ? errores.join(' ') : (err?.error?.message || 'No se pudo publicar la reseña.')
        );
        this.enviando.set(false);
      }
    });
  }
}