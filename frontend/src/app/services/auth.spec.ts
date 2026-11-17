import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth';

function crearToken(exp: number): string {
  const payload = btoa(JSON.stringify({ id: '1', email: 'ana@example.com', esAdmin: false, exp }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.firma`;
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate: () => Promise.resolve(true) } }],
    });
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('does not show an expiration message on a first visit', () => {
    const authService = TestBed.inject(AuthService);

    expect(authService.mensajeSesion()).toBeNull();
  });

  it('does not show an expiration message for an invalid stored token', () => {
    localStorage.setItem('token_cafeteria', 'not-a-jwt');

    const authService = TestBed.inject(AuthService);

    expect(authService.mensajeSesion()).toBeNull();
    expect(localStorage.getItem('token_cafeteria')).toBeNull();
  });

  it('shows an expiration message when a previously valid session has expired', () => {
    const exp = Math.floor(Date.now() / 1000) - 60;
    localStorage.setItem('token_cafeteria', crearToken(exp));

    const authService = TestBed.inject(AuthService);

    expect(authService.mensajeSesion()).toBe('Tu sesión venció. Iniciá sesión nuevamente.');
  });
});
