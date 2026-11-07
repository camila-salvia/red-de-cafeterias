import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // El token solo se manda a nuestra API, nunca a otras URLs
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();
  // En el login un 401 significa "credenciales incorrectas", no "sesión vencida":
  // ese caso lo maneja el componente de login.
  const esLogin = req.url.endsWith('/usuario/login');

  const reqConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqConToken).pipe(
    catchError((error: unknown) => {
      // 401 del backend: token ausente, inválido o vencido
      if (error instanceof HttpErrorResponse && error.status === 401 && !esLogin) {
        authService.forzarLogin(
          token ? 'Tu sesión venció. Iniciá sesión nuevamente.' : 'Iniciá sesión para continuar.'
        );
      }
      // El 403 (rol insuficiente) no se intercepta: cada pantalla recibe el error
      // con el mensaje del backend en error.error.message.
      return throwError(() => error);
    })
  );
};