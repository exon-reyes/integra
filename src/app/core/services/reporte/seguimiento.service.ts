import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TicketService } from '@/core/services/reporte/ticket.service';
import { ResponseData } from '@/shared/util/responseData';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  private ticketService = inject(TicketService);

  crear(ticketId: number, seguimiento: { descripcion: string }): Observable<ResponseData<void>> {
    const params = {
      idTicket: ticketId,
      descripcion: seguimiento.descripcion
    };
    return this.ticketService.agregarSeguimiento(params);
  }
}
