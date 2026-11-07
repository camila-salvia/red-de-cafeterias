import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // sin sesión (o con token vencido)
  if (!authService.estaAutenticado()) {
    if (!authService.mensajeSesion()) {
      authService.mensajeSesion.set('Iniciá sesión para acceder a esta sección.');
    }
    return router.createUrlTree(['/login']);
  }

  // con sesión pero sin rol de administrador: al inicio
  return authService.esAdmin() ? true : router.createUrlTree(['/']);
};