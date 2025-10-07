import { Component, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Ticket } from '@/models/reporte/ticket';

@Component({
    selector: 'ticket-info',
    imports: [UpperCasePipe],
    templateUrl: './ticket-info.component.html',
    styleUrl: './ticket-info.component.scss'
})
export class TicketInfoComponent {
    @Input() ticket?: Ticket | null = null;
}
