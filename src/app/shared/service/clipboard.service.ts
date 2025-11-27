import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
    constructor(private notify: MessageService) {}

    private isClipboardSupported = !!navigator.clipboard;

    /**
     * Copia datos al portapapeles y muestra notificación
     * @param data Texto a copiar
     */
    async copy(data: string, notificationSummary = 'Copiado', notificationDetail = 'Datos copiados al portapapeles'): Promise<void> {
        if (!data) return;

        try {
            if (this.isClipboardSupported) {
                await navigator.clipboard.writeText(data);
            } else {
                this.fallbackCopy(data);
            }

            // Notificación al usuario
            this.notify.add({
                severity: 'info',
                summary: notificationSummary,
                detail: notificationDetail,
                life: 4000
            });
        } catch (error) {
            console.error('Error copiando al portapapeles', error);
            this.notify.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo copiar al portapapeles',
                life: 4000
            });
        }
    }

    /**
     * Método fallback para navegadores antiguos
     */
    private fallbackCopy(text: string) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}
