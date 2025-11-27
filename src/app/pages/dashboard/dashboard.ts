import {Component, OnInit} from '@angular/core';
import {APP_INFO} from '@/config/base.config';

@Component({
    selector: 'app-dashboard',
    imports: [],
    template: `
        <div class="py-8 mt-6">
            <div class="grid grid-cols-12 gap-6 justify-center">
                <div
                    class="col-span-12 mb-16 p-8 lg:p-20 rounded-2xl bg-gradient-to-t from-white/60 to-white/60
             bg-[radial-gradient(77.36%_256.97%_at_77.36%_57.52%,#efe1af_0%,#c3dcfa_100%)]"
                >
                    <div class="flex flex-col items-center text-center">
                        <img alt="Company logo" class="mt-6 w-22" src="/assets/icon/sci.svg" />
                        <h3 class="text-gray-900 text-3xl font-semibold mb-2">Estrategia en evolución</h3>
                        <span class="text-gray-600 text-xl mb-6">{{ APP_INFO.version }}</span>
                        <p [innerHTML]="APP_INFO.devDescription" class="text-gray-800 max-w-3xl leading-relaxed"></p>
                    </div>
                </div>

                <!-- Header -->
                <div class="col-span-12 text-center mb-10">
                    <p class="text-gray-600 dark:text-gray-300 text-lg">Selecciona un módulo para comenzar</p>
                </div>
            </div>
        </div>
        <!--        <features-widget [featuresData]="featureSections"></features-widget>-->
    `
})
export class Dashboard implements OnInit {
    protected readonly APP_INFO = APP_INFO;
    protected featureSections = [];

    ngOnInit(): void {
        this.featureSections = [
            {
                title: 'Herramientas Generales',
                features: [
                    {
                        piIcon: 'pi-chart-bar',
                        title: 'Adm Reporte',
                        urlNavigator: 'reporte/',
                        description: 'Gestión y seguimiento de incidencias',
                        colorBg: 'bg-orange-200'
                    },
                    {
                        piIcon: 'isc isc-registry',
                        title: 'OpenBuilder',
                        description: 'Generador de reportes para áreas de operación',
                        colorBg: 'bg-blue-200',
                        urlNavigator: 'reporte/ticket/add'
                    },
                    {
                        piIcon: 'isc isc-registry',
                        title: 'OpenBuilder',
                        description: 'Generador de reportes para áreas de operación',
                        colorBg: 'bg-blue-200',
                        urlNavigator: 'reporte/ticket/add'
                    },
                    {
                        piIcon: 'isc isc-registry',
                        title: 'OpenBuilder',
                        description: 'Generador de reportes para áreas de operación',
                        colorBg: 'bg-blue-200',
                        urlNavigator: 'reporte/ticket/add'
                    },
                    {
                        piIcon: 'isc isc-registry',
                        title: 'OpenBuilder',
                        description: 'Generador de reportes para áreas de operación',
                        colorBg: 'bg-blue-200',
                        urlNavigator: 'reporte/ticket/add'
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
                        colorBg: 'bg-green-200',
                        urlNavigator: 'sistemas'
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
                        colorBg: 'bg-yellow-200',
                        urlNavigator: 'usuarios'
                    },
                    {
                        piIcon: 'pi-id-card',
                        title: 'Roles',
                        description: 'Administración de roles de operación',
                        colorBg: 'bg-slate-200',
                        urlNavigator: 'usuarios/rol'
                    }
                ]
            },
            {
                title: 'Sistemas TI',
                features: [
                    {
                        // piIcon: 'pi-credit-card',
                        title: 'Cuentas',
                        urlNavigator: 'sistemas/cuenta-prov',
                        description: 'Gestión de cuentas TI',
                        colorBg: 'bg-red-200'
                    }
                ]
            }
        ];
    }
}
