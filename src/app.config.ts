import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { authInterceptor } from '@/core/security/AuthInterceptor';
import { ErrorResponseInterceptor } from '@/core/error-response.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor, ErrorResponseInterceptor])),
        provideAnimationsAsync(),
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        MessageService,
        ConfirmationService,
        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
            translation: {
                emptyMessage: 'Sin registros',
                emptyFilterMessage: 'Sin resultados',
                monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
                today: 'Hoy',
                cancel: 'Cancelar',
                apply: 'Aplicar',
                clear: 'Borrar',
                reject: 'No',
                choose: 'Seleccionar',
                upload: 'Subir',
                fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            }
        })
    ]
};
