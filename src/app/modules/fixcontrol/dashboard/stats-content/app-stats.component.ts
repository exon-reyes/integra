import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { StatsComponent } from '@/shared/component/stats/stats.component';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { TicketCount } from '@/models/reporte/TicketCount';
import { TicketService } from '@/core/services/reporte/ticket.service';
import { Subject, takeUntil } from 'rxjs';
import { MODULE_KEYS } from '@/config/base.config';

export interface StatsData {
    icon_path: string;
    title: string;
    value: any;
    decription: string;
}

@Component({
    selector: 'app-stats-content',
    imports: [StatsComponent, SpinnerComponent],
    templateUrl: './app-stats.component.html',
    styleUrl: './app-stats.component.scss'
})
export class AppStatsComponent implements OnInit, OnDestroy {
    // Signals para el estado
    protected indicadores = signal<TicketCount | null>(null);
    // Computed signal que genera stats_data basado en los indicadores
    stats_data = computed<StatsData[]>(() => {
        const data = this.indicadores();
        if (!data) {
            return this.getDefaultStats();
        }

        return [
            {
                icon_path: './assets/icon/report-notify.svg',
                title: 'Reportes Abiertos',
                value: data.totalAbiertoMes || 0,
                decription: 'Desde el último mes'
            },
            {
                icon_path: './assets/icon/report-open.svg',
                title: 'Reportes en Progreso',
                value: data.totalProgreso || 0,
                decription: 'Eventos en atención actualmente'
            },
            {
                icon_path: './assets/icon/report-all.svg',
                title: 'Reportes Resueltos',
                value: data.totalResuelto || 0,
                decription: 'Aún no se han cerrado'
            }
        ];
    });
    protected cargando = signal<boolean>(false);
    protected error = signal<string | null>(null);
    private readonly ID_DEPARTAMENTO = MODULE_KEYS.ID_DEPARTAMENTO_FIXCONTROL;
    private readonly ticketService = inject(TicketService);
    private readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.obtenerIndicadores();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private obtenerIndicadores(): void {
        this.cargando.set(true);
        this.error.set(null);

        this.ticketService
            .obtenerIndicadores(this.ID_DEPARTAMENTO)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.indicadores.set(response.data);
                    this.cargando.set(false);
                },
                error: (error) => {
                    console.error('Error al obtener indicadores:', error);
                    this.error.set('Error al cargar los indicadores');
                    this.cargando.set(false);
                }
            });
    }

    private getDefaultStats(): StatsData[] {
        return [
            {
                icon_path: './assets/icon/report/report-notify.svg',
                title: 'Reportes Abiertos',
                value: 0,
                decription: 'Cargando...'
            },
            {
                icon_path: './assets/icon/report/report-open.svg',
                title: 'Reportes en Progreso',
                value: 0,
                decription: 'Cargando...'
            },
            {
                icon_path: './assets/icon/report/report-all.svg',
                title: 'Reportes Resueltos',
                value: 0,
                decription: 'Cargando...'
            }
        ];
    }
}
