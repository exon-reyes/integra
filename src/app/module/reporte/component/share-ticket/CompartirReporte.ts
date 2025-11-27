import { Component, inject, Input, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Button } from 'primeng/button';
import { EstatusPublicoService } from '@/shared/service/estatus-publico.service';
import { Ticket } from '@/models/reporte/ticket';
import { TicketService } from '@/core/services/reporte/ticket.service';

@Component({
    selector: 'share-ticket',
    imports: [Button],
    templateUrl: './CompartirReporte.html',
    styleUrl: './CompartirReporte.scss'
})
export class CompartirReporte implements OnDestroy {
    loading = false;
    @Input() ticket!: Ticket;
    private notificacion = inject(MessageService);
    private ticketService = inject(TicketService);
    private estatusPublicoService = inject(EstatusPublicoService);

    private destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cambiarEstatusPublico() {
        if (!this.ticket) return;

        this.loading = true;
        this.ticketService
            .publicar(this.ticket.id, !this.ticket.publicar)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log(response);
                    if (response.success) {
                        this.estatusPublicoService.change(true);
                        this.notificacion.add({
                            life: 6000,
                            summary: 'Proceso completado',
                            detail: response.message,
                            severity: 'info'
                        });
                        this.ticket!.publicar = !this.ticket.publicar;
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error(error);
                    this.loading = false;
                },
                complete: () => {
                    this.loading = false;
                }
            });
    }
}
