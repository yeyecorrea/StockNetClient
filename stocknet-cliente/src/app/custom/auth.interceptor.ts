import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LOCAL_STORAGE } from '@ng-web-apis/common';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Lista de endpoints públicos que no requieren token
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/assets/',
    '/api/auth/login',
    '/api/auth/register'
  ];

  // Verificar si la solicitud es pública
  const isPublicRequest = publicEndpoints.some(endpoint => 
    req.url.includes(endpoint)
  );

  if (isPublicRequest) {
    return next(req);
  }

  // Obtener localStorage de manera segura para SSR
  const localStorage = inject(LOCAL_STORAGE, { optional: true });
  const token = localStorage?.getItem('token');
  const router = inject(Router);

  // Clonar la solicitud con el token si existe
  const authReq = token 
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

   return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Token inválido o expirado
        localStorage?.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};