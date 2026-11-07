import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  // si la sesión venció, estaAutenticado() ya dejó ese mensaje; si no, es que nunca inició sesión
  if (!authService.mensajeSesion()) {
    authService.mensajeSesion.set('Iniciá sesión para acceder a esta sección.');
  }
  return router.createUrlTree(['/login']);
};
