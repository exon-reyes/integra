import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstatusColorService } from '@/shared/service/estatus-color.service';
import { Ticket } from '@/models/reporte/ticket';
import { ArchivoViewerComponent } from '@/shared/component/archivo-viewer/archivo-viewer.component';

@Component({
    selector: 'ticket-generales',
    imports: [DatePipe, FormsModule, ArchivoViewerComponent],
    templateUrl: './info-ticket.component.html',
    standalone: true,
    styleUrl: './info-ticket.component.scss'
})
export class InfoTicketComponent {
    @Input() ticket!: Ticket;

    constructor(private statusService: EstatusColorService) {}

    protected severidad(statusId: any): string {
        return this.statusService.getClass(statusId);
    }

    protected hasImages(): boolean {
        return this.ticket?.descripcion?.includes('<img') || false;
    }
}
