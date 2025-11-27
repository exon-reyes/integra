import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ResponseData } from '@/core/responseData';
import { Checklist } from '../../../models/checklist/checklist';
import { ActualizarActividadRequest } from '@/models/checklist/request/actualizar-actividad.request';

export enum TIPOCHECKLIST {
    GENERAL = 'GENERAL',
    OBSERVACION = 'OBSERVACION'
}

@Injectable({
    providedIn: 'root'
})
export class ChecklistService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.integraApi}/checklist`;

    obtenerChecklist(ticketId: number): Observable<Checklist> {
        return this.http.get<ResponseData<Checklist>>(`${this.API_URL}/ticket/${ticketId}`).pipe(map((response) => response.data));
    }

    actualizarActividad(tipo: TIPOCHECKLIST, actividadId: number, request: ActualizarActividadRequest): Observable<void> {
        console.log('Request completada:', request.completada, typeof request.completada);
        const completadaStr = String(request.completada);
        console.log('Completada string:', completadaStr);

        const params = new HttpParams().set('completada', completadaStr);

        console.log('Params:', params.toString());
        if (tipo === TIPOCHECKLIST.GENERAL) {
            return this.http.put<ResponseData<void>>(`${this.API_URL}/actividad/${actividadId}`, null, { params }).pipe(map(() => void 0));
        } else {
            return null;
        }
    }

    crearChecklist(tipo: TIPOCHECKLIST, ticketId: number, checklist: any): Observable<ResponseData<void>> {
        if (tipo === TIPOCHECKLIST.GENERAL) {
            return this.http.post<ResponseData<void>>(`${this.API_URL}/ticket/${ticketId}`, checklist);
        } else {
            return null;
        }
    }
}
