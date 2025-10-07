import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { APP_INFO } from '@/config/base.config';
import { RouterLink } from '@angular/router'; // CORRECTO

interface Feature {
    title: string;
    description: string;
    bg: string;
    piIcon?: string;
    url?: string;
    svg?: SafeHtml;
}

interface FeatureSection {
    title: string;
    features: Feature[];
}

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './features-widget.component.html'
})
export class FeaturesWidget {
    featuresSections: FeatureSection[] = [];
    protected readonly APP_INFO = APP_INFO;

    constructor(private sanitizer: DomSanitizer) {
        this.initFeatures();
    }

    private initFeatures() {
        this.featuresSections = [
            {
                title: 'Herramientas Generales',
                features: [
                    {
                        piIcon: 'pi-chart-bar',
                        title: 'Adm Reporte',
                        url: 'reporte/',
                        description: 'Gestión y seguimiento de incidencias',
                        bg: 'bg-orange-200'
                    },
                    {
                        piIcon: 'isc isc-registry',
                        title: 'OpenBuilder',
                        description: 'Generador de reportes para áreas de operación',
                        bg: 'bg-blue-200',
                        url: 'reporte/ticket/add'
                    }
                ]
            },
            {
                title: 'Auditoría Interna',
                features: [
                    {
                        piIcon: 'pi-chart-line',
                        title: 'Registrar observaciones',
                        description: 'Registro de observaciones para las áreas de interés',
                        bg: 'bg-green-200',
                        url: 'sistemas'
                    }
                ]
            },
            {
                title: 'Gestión de Usuarios',
                features: [
                    {
                        piIcon: 'pi-users',
                        title: 'Usuarios',
                        description: 'Administrar usuarios del sistema.',
                        bg: 'bg-yellow-200',
                        url: 'usuarios'
                    },
                    {
                        piIcon: 'pi-id-card',
                        title: 'Roles',
                        description: 'Administración de roles de operación',
                        bg: 'bg-slate-200',
                        url: 'usuarios/rol'
                    }
                ]
            },
            {
                title: 'Sistemas TI',
                features: [
                    {
                        //             svg: this.sanitizer.bypassSecurityTrustHtml(`
                        //   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M8.431 5.385c-.826 0-1.586.347-2.143.903s-.902 1.316-.902 2.142v76.997c0 .59.379 1.158.926 1.615.805.676 1.873 1.076 2.804 1.076h9.585v-7.51a2.69 2.69 0 0 1 2.692-2.691h14.453a2.69 2.69 0 0 1 2.692 2.691v7.51h47.527v-7.51a2.69 2.69 0 0 1 2.692-2.691h14.334a2.69 2.69 0 0 1 2.692 2.691v7.51h9.018c.711 0 1.382-.314 1.88-.813s.813-1.168.813-1.879V19.233a2.68 2.68 0 0 0-2.693-2.693H64.887a2.693 2.693 0 0 1-2.692-2.692c0-2.134-.003-4.664-.659-6.395-.452-1.193-1.391-2.067-3.306-2.067H8.431zm60.173 52.9h39.33v5.227h-39.33zm0-27.329h39.33v5.226h-39.33zm0 13.665h39.33v5.227h-39.33zM26.408 27.895v4.501c-2.268.578-2.162 6.792.36 6.792.777-.014 4.376 5.216 4.906 6.088 1.028 1.691 0 2.313 0 3.469-11.033 2.488-14.216 3.6-14.216 14.766h38.557c0-11.166-3.184-12.277-14.216-14.766 0-1.375-.911-1.969 0-3.469 1.028-1.692 2.911-4.06 4.846-6.089 2.659.05 2.725-6.204.42-6.792v-4.501c-.001-10.844-20.657-10.844-20.657.001M2.48 2.481A8.4 8.4 0 0 1 8.431 0h49.798c4.727 0 7.118 2.351 8.334 5.56.675 1.782.901 3.732.978 5.595h47.261a8.05 8.05 0 0 1 5.713 2.366 8.05 8.05 0 0 1 2.365 5.712v66.195c0 2.197-.924 4.221-2.391 5.688s-3.489 2.389-5.688 2.389h-11.71a2.69 2.69 0 0 1-2.692-2.691v-7.51H91.45v7.51a2.69 2.69 0 0 1-2.692 2.691H35.846a2.69 2.69 0 0 1-2.693-2.691v-7.51h-9.067v7.51a2.69 2.69 0 0 1-2.692 2.691H9.116c-2.123 0-4.504-.871-6.253-2.338C1.172 89.75 0 87.775 0 85.428V8.43c0-2.313.953-4.422 2.48-5.949"/></svg>
                        // `),
                        piIcon: 'pi-credit-card',
                        title: 'Cuentas',
                        url: 'sistemas/cuenta-prov',
                        description: 'Gestión de cuentas TI',
                        bg: 'bg-red-200'
                    }
                ]
            }
        ];
    }
}
