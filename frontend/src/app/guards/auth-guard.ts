import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token_cafeteria');
  if(token) {
    return true;
  } else {
    alert('Debes iniciar sesión para acceder a esta sección');
    router.navigate(['/login']);
    return false;
  }
};
