import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';
import { ComentariosComponent } from './comentarios';

describe('ComentariosComponent', () => {
  let component: ComentariosComponent;
  let fixture: ComponentFixture<ComentariosComponent>;
  let isLoggedIn: ReturnType<typeof signal<boolean>>;
  let getComentarios: ReturnType<typeof vi.fn>;
  let crearComentario: ReturnType<typeof vi.fn>;

  const comentarioApi = {
    id: 'comentario-1',
    contenido: 'Buen café',
    fecha_publicacion: '2026-11-16T12:00:00.000Z',
    puntuacion: 5,
    usuario: { id: 'usuario-1', nombre: 'Camila' },
  };

  beforeEach(async () => {
    isLoggedIn = signal(false);
    getComentarios = vi.fn().mockReturnValue(of({ data: [comentarioApi] }));
    crearComentario = vi.fn().mockReturnValue(of({ data: comentarioApi }));

    await TestBed.configureTestingModule({
      imports: [ComentariosComponent],
      providers: [
        { provide: AuthService, useValue: { isLoggedIn } },
        {
          provide: ApiService,
          useValue: { getComentarios, crearComentario },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComentariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga las reseñas persistidas desde la API y convierte la fecha', () => {
    expect(getComentarios).toHaveBeenCalledOnce();
    expect(component.resenas()).toHaveLength(1);
    expect(component.resenas()[0].usuario.nombre).toBe('Camila');
    expect(component.resenas()[0].fecha_publicacion).toBeInstanceOf(Date);
  });

  it('permite reintentar si falla la carga de reseñas', () => {
    getComentarios.mockReturnValueOnce(throwError(() => new Error('offline')));

    component.cargarResenas();

    expect(component.errorCarga()).toContain('No pudimos cargar');
    expect(component.cargando()).toBe(false);

    getComentarios.mockReturnValueOnce(of({ data: [comentarioApi] }));
    component.cargarResenas();

    expect(component.errorCarga()).toBeNull();
    expect(component.resenas()).toHaveLength(1);
  });

  it('publica sin enviar datos de usuario y agrega la respuesta del servidor', () => {
    isLoggedIn.set(true);
    component.marcarEstrella(4);
    component.textoComentario.set('  Muy rico  ');
    crearComentario.mockReturnValueOnce(of({ data: comentarioApi }));

    component.enviarResena();

    expect(crearComentario).toHaveBeenCalledWith({
      puntuacion: 4,
      contenido: 'Muy rico',
    });
    expect(component.resenas()[0].id).toBe('comentario-1');
    expect(component.enviando()).toBe(false);
  });
});