import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LOCAL_STORAGE } from '@ng-web-apis/common';

export const authGuard: CanActivateFn = (route, state) => {
  const localStorage = inject(LOCAL_STORAGE, { optional: true });
  const token = localStorage?.getItem('token');
  const router = inject(Router);
  const authService  = inject(AuthService);

  if(!token) {
    router.navigate(['/login']);
    return of(false);
  }

  // Verificar si el token es válido en el backend
  return authService.validateToken(token).pipe(
    map(response => {
      if (response.success) {
        return true; // El token es válido, permitir el acceso
      } else {
        router.navigate(['/login']); // Token inválido, redirigir a login
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']); // Error al validar el token, redirigir a login
      return of(false);
    })
  )
};
