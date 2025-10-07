import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ConfirmationService, MessageService} from 'primeng/api';

// Interceptor principal
export const ErrorResponseInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
    const router = inject(Router);
    const confirmationService = inject(ConfirmationService);
    const messageService = inject(MessageService);

    return next(req).pipe(catchError((error: HttpErrorResponse) => {
        handleHttpError(error, router, confirmationService, messageService);
        return throwError(() => error);
    }));
};

// Función para extraer mensaje directo del backend
function getBackendMessage(error: HttpErrorResponse): string {
    // Si hay errores de validación (array de objetos), formatearlos
    if (error.error?.validationErrors && Array.isArray(error.error.validationErrors)) {
        return error.error.validationErrors.map((err: any) => err.message || err).join(', ');
    }

    if (error.error?.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
    }

    // Solo extraer el mensaje directo del backend sin modificaciones
    return error.error?.message ||
        error.error?.error ||
        error.error?.detail ||
        'Ocurrió un error inesperado';
}

// Lógica de manejo de errores
function handleHttpError(error: HttpErrorResponse, router: Router, cs: ConfirmationService, ms: MessageService): void {
    // Detectar errores de conexión
    const isConnectionError = error.status === 0 || 
                             error.error instanceof ProgressEvent ||
                             error.message?.includes('ERR_CONNECTION_REFUSED') ||
                             error.message?.includes('Failed to fetch');

    if (isConnectionError) {
        cs.confirm({
            header: 'Servidor no disponible',
            message: 'No se pudo establecer conexión con el servidor. ¿Desea intentar nuevamente?',
            icon: 'pi pi-cloud-download',
            acceptLabel: 'Reintentar',
            rejectLabel: 'Cancelar',
            acceptButtonProps: {icon: 'pi pi-refresh', outlined: true, size: 'small'},
            accept: () => window.location.reload()
        });
        return;
    }

    // Manejar errores de conexión a Internet
    if (!navigator.onLine) {
        ms.add({severity: 'warn', summary: 'Sin conexión', detail: 'No tienes conexión a Internet.'});
        return;
    }

    // Usar el manejador de estatus específico
    const handler = statusHandlers[error.status] || defaultHandler;
    handler(cs, ms, router, error);
}

// Manejadores de estatus
type ErrorHandler = (cs: ConfirmationService, ms: MessageService, router: Router, error: HttpErrorResponse) => void;

const statusHandlers: Record<number, ErrorHandler> = {


    // Petición incorrecta
    400: (cs, ms, __, error) => {
        // Cerrar el modal de registro primero
        setTimeout(() => {
            // Si hay errores de validación, mostrarlos en diálogo
            if (error.error?.validationErrors && Array.isArray(error.error.validationErrors)) {
                const errorList = error.error.validationErrors
                    .map((errorObj: any, index: number) => `${index + 1}. ${errorObj.message || errorObj}`)
                    .join('<br>');
                
                cs.confirm({
                    header: 'Errores de validación',
                    message: errorList,
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Entendido',
                    rejectVisible: false
                });
            } else if (error.error?.errors && Array.isArray(error.error.errors)) {
                const errorList = error.error.errors
                    .map((errorMsg: string, index: number) => `${index + 1}. ${errorMsg}`)
                    .join('<br>');
                
                cs.confirm({
                    header: 'Errores de validación',
                    message: errorList,
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Entendido',
                    rejectVisible: false
                });
            } else {
                const detail = getBackendMessage(error);
                cs.confirm({
                    header: 'Solicitud incorrecta',
                    message: detail,
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: 'Entendido',
                    rejectVisible: false
                });
            }
        }, 100);
    },

    // No autorizado
    401: (cs, _, router) => cs.confirm({
        header: 'Autenticación requerida',
        message: 'Tu sesión ha expirado. ¿Quieres iniciar sesión nuevamente?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Iniciar sesión',
        rejectLabel: 'Cancelar',
        accept: () => router.navigate(['auth/login'])
    }),

    // Acceso denegado
    403: (_, ms, __, error) => {
        const detail = getBackendMessage(error);
        ms.add({
            severity: 'error',
            summary: 'Acceso denegado',
            detail
        });
    },

    // Conflicto (409) - Mostrar en diálogo
    409: (cs, _, __, error) => {
        const detail = getBackendMessage(error);
        setTimeout(() => {
            cs.confirm({
                header: 'Conflicto',
                message: detail,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Entendido',
                rejectVisible: false
            });
        }, 100);
    },

    // Error de validación (Entidad no procesable)
    422: (_, ms, __, error) => {
        const detail = getBackendMessage(error);
        ms.add({
            severity: 'warn',
            summary: 'Datos inválidos',
            detail
        });
    },

    // Error interno del servidor
    500: (cs, __, ___, error) => {
        const detail = getBackendMessage(error);
        cs.confirm({
            header: 'Error del servidor',
            message: detail,
            icon: 'pi pi-exclamation-circle',
            acceptLabel: 'Recargar',
            rejectLabel: 'Cerrar',
            accept: () => window.location.reload()
        });
    },
};

const defaultHandler: ErrorHandler = (_, ms, __, error) => {
    const detail = getBackendMessage(error);
    ms.add({
        severity: 'error',
        summary: `Error ${error.status}`,
        detail
    });
};
