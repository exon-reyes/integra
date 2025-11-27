import { Component, OnInit } from '@angular/core';
import { FeatureSection, FeaturesWidget } from '@/pages/dashboard/components/featureswidget';

@Component({
    selector: 'app-modulos',
    imports: [FeaturesWidget],
    templateUrl: './modulos.html',
    styleUrl: './modulos.scss'
})
export class Modulos implements OnInit {
    modulos: FeatureSection[];

    ngOnInit(): void {
        this.modulos = [
            {
                title: 'Aplicaciones',
                features: [
                    { title: 'Reloj Checador', srcIconName: 'reloj.svg', description: 'Acceso a la App Reloj Checador', colorBg: 'bg-gray-200', urlNavigator: '/integra/checador' },
                    { title: 'Asistencia manual', urlNavigator: '/integra/asistencia/manual', description: 'En caso de eventos no controlados', colorBg: 'bg-gray-200', srcIconName: 'touch.svg' }
                ]
            },
            {
                title: 'Incidencias'
            },
            {
                title: 'Gestión de asistencia',
                features: [
                    { title: 'Consulta de asistencia', description: 'Jornadas registradas en cada centro de trabajo. Entradas, salidas', colorBg: 'bg-gray-200', srcIconName: 'schedule.svg', urlNavigator: '/integra/asistencia/consulta' },
                    { urlNavigator: '/integra/asistencia/compensacion', title: 'Compensaciones realizadas', srcIconName: 'expired.svg', description: 'Consulta el tiempo aplicado como ajuste final a la jornada del empleado.', colorBg: 'bg-gray-200' },
                    { title: 'Exportación de incidencias', urlNavigator: '/integra/asistencia/exportar', srcIconName: 'excel.svg', description: 'Formato de datos precargados y sincronizados con el Reloj Checador', colorBg: 'bg-gray-200' }
                ]
            },
            {
                title: 'Configuración',
                features: [{ title: 'Config. Reloj', description: 'Gestiona las autorizaciones y tiempos de compensación asignados a las unidades', colorBg: 'bg-gray-200', urlNavigator: '/integra/asistencia/kioscos', srcIconName: 'timelimit.svg' }]
            }
        ];
    }
}
