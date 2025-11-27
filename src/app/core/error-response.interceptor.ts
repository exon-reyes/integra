import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { JWTService } from '@/core/security/JWTService';

export const ErrorResponseInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const messageService = inject(MessageService);
    const router = inject(Router);
    const jwtService = inject(JWTService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            console.error('[ErrorResponseInterceptor] Error HTTP:', error);

            /**
             * 🔹 CASO 1: Error de red o servidor no disponible
             *  - status = 0 significa que Angular no pudo conectarse al backend.
             *  - También se da si hay error CORS o el backend está apagado.
             */
            if (error.status === 0 || error.message === 'Failed to fetch') {
                messageService.add({
                    severity: 'error',
                    summary: 'Servidor no disponible',
                    detail: 'No se pudo conectar con el servidor. Verifica tu conexión o inténtalo más tarde.',
                    life: 8000
                });
                return throwError(() => error);
            }

            /**
             * 🔹 CASO 2: Error del cliente (ErrorEvent)
             */
            if (error.error instanceof ErrorEvent) {
                messageService.add({
                    severity: 'error',
                    summary: 'Error del cliente',
                    detail: error.error.message || 'Ocurrió un problema al procesar la solicitud localmente.'
                });
                return throwError(() => error);
            }

            /**
             * 🔹 CASO 3: Errores devueltos por el backend (HTTP 4xx / 5xx)
             */
            switch (error.status) {
                case 400:
                    messageService.add({
                        severity: 'warn',
                        summary: 'Solicitud incorrecta',
                        detail: error.error?.message || 'Los datos enviados no son válidos.'
                    });
                    break;
                case 403:
                    messageService.add({
                        severity: 'error',
                        summary: 'Acceso denegado',
                        detail: 'No tienes permisos para realizar esta acción.'
                    });
                    break;

                case 404:
                    messageService.add({
                        severity: 'info',
                        summary: 'No encontrado',
                        detail: 'El recurso solicitado no existe o fue eliminado.'
                    });
                    break;

                case 409:
                    messageService.add({
                        severity: 'warn',
                        summary: error.error?.title || 'Conflicto de datos',
                        life: 12000,
                        detail: error.error?.message || 'No se puede completar la operación debido a un conflicto en los datos.'
                    });
                    break;

                case 422:
                    messageService.add({
                        severity: 'warn',
                        summary: 'Datos no procesables',
                        detail: error.error?.message || 'Los datos enviados no cumplen con las reglas de validación.'
                    });
                    break;

                case 500:
                    messageService.add({
                        severity: 'error',
                        summary: 'Error interno del servidor',
                        detail: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde.'
                    });
                    break;

                default:
                    messageService.add({
                        severity: 'error',
                        summary: `Error ${error.status || 'desconocido'}`,
                        detail: error.error?.message || 'Ocurrió un error no identificado.'
                    });
                    break;
            }

            return throwError(() => error);
        })
    );
};
