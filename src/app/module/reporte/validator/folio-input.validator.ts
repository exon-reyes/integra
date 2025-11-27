import { inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SearchStatusService } from '@/shared/service/search.status.service';
import { TicketService } from '@/core/services/reporte/ticket.service';

export function folioExisteValidator(): AsyncValidatorFn {
    const folioService = inject(TicketService);
    const searchStatus = inject(SearchStatusService);
    console.log('Consultando....');
    return (control: AbstractControl) => {
        const folio = control.value;
        if (!folio) return of(null);
        searchStatus.state(true);
        console.log('Consultando 2....');
        return folioService.checkFolio(folio).pipe(
            map((existe) => {
                searchStatus.state(false);
                return existe ? { folioExistente: true } : null;
            }),
            catchError(() => {
                searchStatus.state(false);
                return of(null);
            })
        );
    };
}
