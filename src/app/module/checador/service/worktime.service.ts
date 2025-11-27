// ... (importaciones y código anterior)

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, throttleTime } from 'rxjs/operators';
import { Empleado } from '@/core/services/checador/Empleado';
import { TipoPausa } from '@/core/services/checador/TipoPausa';
import { environment } from '@env/environment';
import { ResponseData } from '@/core/responseData';

@Injectable({
    providedIn: 'root'
})
export class WorktimeService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.integraApi}/asistencia`;

    // Rate limiting subjects para prevenir saturación
    private readonly accionSubject = new Subject<{ tipo: string; payload: any }>();

    constructor() {
        // Pipeline anti-saturación con throttleTime y switchMap
        this.accionSubject
            .pipe(
                throttleTime(1000), // Máximo 1 acción por segundo
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                switchMap(({ tipo, payload }) => this.ejecutarAccion(tipo, payload))
            )
            .subscribe();
    }

    consultarEmpleadoPorNip(nip: string): Observable<ResponseData<Empleado>> {
        return this.http.get<ResponseData<Empleado>>(`${this.apiUrl}/${nip}`);
    }

    iniciarJornada(empleadoId: number, fotoBase64: string | null, unidadId: number, unidadAsignadaId: number): Observable<ResponseData<any>> {
        const body: any = { empleadoId, unidadId, unidadAsignadaId };
        if (fotoBase64) body.foto = fotoBase64;
        return this.enviarAccionProtegida('iniciar', body);
    }

    finalizarJornada(empleadoId: number, fotoBase64: string | null, unidadId: number, unidadAsignadaId: number): Observable<ResponseData<any>> {
        const body: any = { empleadoId, unidadId, unidadAsignadaId };
        if (fotoBase64) body.foto = fotoBase64;
        return this.enviarAccionProtegida('finalizar', body);
    }

    finalizarJornadaDeposito(empleadoId: number, fotoBase64: string | null, unidadId: number, unidadAsignadaId: number): Observable<ResponseData<any>> {
        const body: any = { empleadoId, unidadId, unidadAsignadaId, finDeposito: true };
        if (fotoBase64) body.foto = fotoBase64;
        return this.enviarAccionProtegida('finalizar', body);
    }

    iniciarPausa(empleadoId: number, tipoPausa: TipoPausa, fotoBase64: string | null, unidadId: number, unidadAsignadaId: number): Observable<ResponseData<any>> {
        const body: any = { empleadoId, pausa: tipoPausa, unidadId, unidadAsignadaId };
        if (fotoBase64) body.foto = fotoBase64;
        return this.enviarAccionProtegida('pausa/iniciar', body);
    }

    finalizarPausa(empleadoId: number, tipoPausa: TipoPausa, fotoBase64: string | null, unidadId: number, unidadAsignadaId: number): Observable<ResponseData<any>> {
        const body: any = { empleadoId, pausa: tipoPausa, unidadId, unidadAsignadaId };
        if (fotoBase64) body.foto = fotoBase64;
        return this.enviarAccionProtegida('pausa/finalizar', body);
    }

    private enviarAccionProtegida(endpoint: string, body: any): Observable<ResponseData<any>> {
        return this.ejecutarAccion(endpoint, body);
    }

    private ejecutarAccion(endpoint: string, body: any): Observable<ResponseData<any>> {
        return this.http.post<ResponseData<any>>(`${this.apiUrl}/${endpoint}`, body);
    }

    registroManual(registroData: {
        empleadoId: number;
        tipoAccion: 'iniciarJornada' | 'finalizarJornada' | 'finalizarJornadaDeposito' | 'iniciarPausa' | 'finalizarPausa';
        pausa?: 'COMIDA' | 'OTRA';
        hora: string;
        observaciones: string;
        unidadId: number;
        unidadAsignadaId?: number;
    }): Observable<ResponseData<any>> {
        return this.http.post<ResponseData<any>>(`${this.apiUrl}/manual`, registroData);
    }
}
