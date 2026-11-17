import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let token: string | null;
  let forzarLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    token = 'token-de-prueba';
    forzarLogin = vi.fn();
    TestBed.configureTestingModule({
      providers: [{
        provide: AuthService,
        useValue: {
          getToken: () => token,
          forzarLogin,
        },
      }],
    });
  });

  it('attaches the JWT to the order creation request', () => {
    let requestEnviada: HttpRequest<unknown> | undefined;
    const request = new HttpRequest('POST', `${environment.apiUrl}/pedido`, {});
    const next = vi.fn((req: HttpRequest<unknown>) => {
      requestEnviada = req;
      return of(new HttpResponse({ status: 201 }));
    });

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe();

    expect(requestEnviada?.headers.get('Authorization')).toBe('Bearer token-de-prueba');
  });

  it('preserves the cart when an order request is rejected as unauthorized', () => {
    const request = new HttpRequest('POST', `${environment.apiUrl}/pedido`, {});
    const next = vi.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe({
      error: () => undefined,
    });

    expect(forzarLogin).toHaveBeenCalledWith('Tu sesión venció. Iniciá sesión nuevamente.', true);
  });
});
