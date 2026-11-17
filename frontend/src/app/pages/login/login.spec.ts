import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let crearUsuario: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    crearUsuario = vi.fn(() => of({ message: 'Usuario creado' }));
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: ApiService, useValue: { login: () => undefined, crearUsuario } },
        {
          provide: AuthService,
          useValue: {
            mensajeSesion: { asReadonly: () => () => null, set: () => undefined },
            login: () => undefined,
            esAdmin: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates an account and returns to login with a success message', () => {
    component.nombre.set('Ana');
    component.apellido.set('Pérez');
    component.telefono.set('123456789');
    component.direccion.set('Calle 123');
    component.email.set('ana@example.com');
    component.password.set('secreto');
    component.vistaLogin.set(false);

    component.crearCuenta();

    expect(crearUsuario).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellido: 'Pérez',
      telefono: 123456789,
      direccion: 'Calle 123',
      email: 'ana@example.com',
      password: 'secreto',
    });
    expect(component.vistaLogin()).toBe(true);
    expect(component.mensajeRegistro()).toContain('Cuenta creada');
  });

  it('shows an error when the email is already registered', () => {
    crearUsuario.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: { message: 'El correo electrónico ya se encuentra registrado.' },
    })));
    component.nombre.set('Ana');
    component.apellido.set('Pérez');
    component.telefono.set('123456789');
    component.direccion.set('Calle 123');
    component.email.set('ana@example.com');
    component.password.set('secreto');

    component.crearCuenta();

    expect(component.mensajeError()).toBe('Ese email ya se encuentra registrado.');
    expect(component.cargando()).toBe(false);
  });

  it('does not send incomplete registration data', () => {
    component.crearCuenta();

    expect(crearUsuario).not.toHaveBeenCalled();
    expect(component.mensajeError()).toBe('Por favor, completa todos los campos.');
  });
});
