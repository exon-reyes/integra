import { HttpErrorResponse } from '@angular/common/http';

export function getBackendMessage(error: HttpErrorResponse): string {
    console.log('getBackendMessage', error);
    // Si hay errores de validación (array de objetos), formatearlos
    if (error.error?.validationErrors && Array.isArray(error.error.validationErrors)) {
        return error.error.validationErrors.map((err: any) => err.message || err).join(', ');
    }

    if (error.error?.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
    }

    // Solo extraer el mensaje directo del backend sin modificaciones
    return error.error?.message || error.error?.error || error.error?.detail || 'Ocurrió un error inesperado';
}
