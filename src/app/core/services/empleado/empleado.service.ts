import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { ResponseData } from '@/core/responseData';
import { Empleado } from '@/models/empleado/empleado';
import { catchError, of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class EmpleadoService {
    private readonly apiUrl = `${environment.integraApi}/empleados`;
    private readonly http = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    obtenerEmpleados(idPuesto: number, estatus: string) {
        return this.http
            .get<ResponseData<Empleado[]>>(`${this.apiUrl}`, {
                params: { idPuesto, estatus }
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    debugger;
                    let handled = false;
                    switch (error.status) {
                        case 403:
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Acceso denegado',
                                detail: 'No tienes permisos para consultar empleados.'
                            });
                            handled = true;
                            break;

                        case 404:
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Sin resultados',
                                detail: 'No se encontraron empleados con esos filtros.'
                            });
                            handled = true;
                            break;
                    }

                    //Si el error se manejó, devolvemos un valor neutro
                    if (handled) {
                        return of({
                            success: false,
                            message: 'Error controlado localmente',
                            data: [] as Empleado[]
                        });
                    }

                    //  Si no, lo dejamos subir al interceptor global
                    return throwError(() => error);
                })
            );
    }
}
