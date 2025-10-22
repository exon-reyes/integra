import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/core/services/auth/AuthService';
import { Observable, throwError, switchMap, catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // No token: sigue con la petición normal.
    if (!token) {
        return next(req);
    }

    // Evita interceptar tu propio endpoint de refresh.
    if (req.url.includes('/refresh')) {
        return next(req);
    }

    // Token por expirar: muestra aviso (solo si NO está expirado aún).
    if (!authService.isTokenExpired(token) && authService.isTokenExpiringSoon()) {
        authService.notifyTokenExpiringSoon();
    }

    // Token expirado: intenta refresh SOLO UNA VEZ.
    if (authService.isTokenExpired(token)) {
        console.warn('Token expirado');
        return authService.refreshToken().pipe(
            switchMap(() => {
                const newToken = authService.getToken();
                if (!newToken) {
                    authService.logout();
                    return throwError(() => new Error('No se pudo renovar el token'));
                }
                const authReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(authReq);
            }),
            catchError((err) => {
                authService.logout();
                return throwError(() => err);
            })
        );
    }

    // Token válido: sigue normal.
    const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next(authReq).pipe(
        catchError((error) => {
            // Si recibimos 401 Y no es refresh, intenta refresh sólo una vez.
            if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        const newToken = authService.getToken();
                        if (!newToken) {
                            authService.logout();
                            return throwError(() => new Error('No se pudo renovar el token'));
                        }
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    }),
                    catchError((err) => {
                        authService.logout();
                        return throwError(() => err);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
