import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {MenuItem, MessageService} from 'primeng/api';
import {TitleComponent} from '@/shared/component/title/title.component';
import {Menubar} from 'primeng/menubar';
import {Button} from 'primeng/button';
import {CopyComponent} from '@/shared/component/copy/copy.component';
import {DatePipe, NgClass} from '@angular/common';
import {EstatusColorService} from '@/shared/service/estatus-color.service';
import {Table, TableModule} from 'primeng/table';
import {FiltroTicketComponent} from '@/module/reporte/component/filtro/filtro-ticket.component';
import {RegistrarActividadComponent} from '@/module/reporte/pages/registrar-actividad/registrar-actividad.component';
import {SpinnerComponent} from '@/shared/component/spinner.component';
import {RouterLink} from '@angular/router';
import {Ticket} from '@/models/reporte/ticket';
import {Page} from '@/shared/util/page';
import {buildCopyString} from '@/module/reporte/util/ReporteUtil';
import {Subject, takeUntil} from 'rxjs';
import {FiltroTicketService} from '@/core/filters/filtro-ticket.service';
import {TicketService} from '@/core/services/reporte/ticket.service';

@Component({
    selector: 'app-fixcontrol-admin',
    imports: [TitleComponent, Menubar, Button, CopyComponent, DatePipe, FiltroTicketComponent, FormsModule, IconField, InputIcon, InputText, Paginator, RegistrarActividadComponent, SpinnerComponent, TableModule, NgClass, RouterLink],
    templateUrl: './fixcontrol-admin.component.html',
    styleUrl: './fixcontrol-admin.component.scss'
})
export class FixcontrolAdminComponent implements OnInit {
    protected searchTicketStatus: boolean;
    protected openFilter: boolean;
    protected activeFilter: boolean;
    protected addSeguimiento: boolean;
    protected items: MenuItem[] | undefined;
    protected tickets: Ticket[] = [];
    protected pagina = new Page();
    protected searchValue = '';
    protected selectedTicket: Ticket;
    protected readonly buildCopyString = buildCopyString;
    private ID_DEPARTAMENTO = 12;
    private unsubscribe$ = new Subject<void>();
    private propTicketFilter = inject(FiltroTicketService);
    private notificacionService = inject(MessageService);
    private ticketService = inject(TicketService);
    private estatusService = inject(EstatusColorService);

    obtenerGravedad(statusId: number): string {
        return this.estatusService.getClass(statusId);
    }

    synchronizeTable(dt: Table) {
        this.propTicketFilter.execute('BUSCAR_POR_FILTRO', null);
        this.propTicketFilter.reset();
        this.searchValue = '';
        dt.clear();
        this.tickets = [];
        this.pagina.reset();
        this.cargarTickets();
        this.propTicketFilter.execute('REMOVE_FILTER', null);
    }

    ngOnInit(): void {
        this.items = [{label: 'Nuevo', icon: 'pi pi-plus', routerLink: 'observaciones/add'}, {
            label: 'Buscar folio', icon: 'pi pi-observaciones', command: () => {
                this.searchTicketStatus = true;
            }
        }];
        this.pagina.reset();
        this.propTicketFilter.reset();
        this.eventoFiltro();
        this.cargarTickets();
    }

    cargarTickets() {
        this.pagina.loading = true;
        let params = this.propTicketFilter.build();
        params.departamento = this.ID_DEPARTAMENTO;
        this.ticketService
            .obtenerGenerales(params)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (response) => {
                    this.tickets = response.data || [];
                    this.pagina.change(false, response.meta['totalItems']);
                }, error: (err) => {
                    console.error(err);
                    this.pagina.loading = false;
                }
            });
    }

    eventoFiltro() {
        this.propTicketFilter.subject.pipe(takeUntil(this.unsubscribe$)).subscribe({
            next: (value) => {
                if (value.key === 'BUSCAR_POR_FILTRO') {
                    this.activeFilter = true;
                } else if (value.key === 'BUSCAR_FOLIO') {
                    this.searchTicketStatus = false;
                } else if (value.key === 'REMOVE_FILTER') {
                    this.activeFilter = false;
                }
                this.cargarTickets();
            }
        });
    }

    onPageChange($event: PaginatorState) {
        this.pagina.changePage($event.first, $event.rows);
        this.propTicketFilter.asignarPagina($event.page, this.pagina.rows);
        this.cargarTickets();
    }

    openModalSeguimiento(ticket: Ticket) {
        this.selectedTicket = ticket;
        this.addSeguimiento = true;
    }

    copy(ticket: Ticket) {
        if (ticket) {
            navigator.clipboard.writeText(buildCopyString(ticket)).then((value) => {
                this.notificacionService.add({
                    life: 6000, summary: 'Copiado', detail: 'Ticket copiado', severity: 'info'
                });
            });
        }
    }
}
