import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResponseData } from '@/shared/util/responseData';
import { environment } from '@env/environment';
import { Unidad } from '@/models/empresa/unidad';
import { HorarioOperativo } from '@/models/empresa/horario-operativo';
import { AbstractService } from '@/shared/service/abstract-service';

@Injectable({
    providedIn: 'root'
})
export class UnidadService extends AbstractService {
    private readonly apiUrl = `${environment.integraApi}`;
    private data?: ResponseData<Unidad[]>;
    private cacheTimestamp?: number;
    private readonly cacheDurationMs = 1 * 60 * 1000; // 5 minutos en milisegundos

    constructor() {
        super();
        this.leerLocalStorage();
    }

    obtenerUnidades(): Observable<ResponseData<Unidad[]>> {
        const now = Date.now();
        if (this.data && this.cacheTimestamp && now - this.cacheTimestamp < this.cacheDurationMs) {
            return of(this.data);
        } else {
            return this.http.get<ResponseData<Unidad[]>>(`${this.apiUrl}/unidades`).pipe(
                tap((data) => {
                    this.data = data;
                    this.cacheTimestamp = now;
                    localStorage.setItem('unidades', JSON.stringify(data));
                    localStorage.setItem('unidades_timestamp', this.cacheTimestamp.toString());
                })
            );
        }
    }

    obtenerContacto(idUnidad): Observable<ResponseData<Unidad>> {
        return this.http.get<ResponseData<Unidad>>(`${this.apiUrl}/unidades/contacto/${idUnidad}`, {
            params: { idUnidad }
        });
    }

    obtenerHorarios(idUnidad): Observable<ResponseData<HorarioOperativo[]>> {
        return this.http.get<ResponseData<HorarioOperativo[]>>(`${this.apiUrl}/unidades/horario/${idUnidad}`);
    }

    registrarUnidad(unidad: any): Observable<ResponseData<void>> {
        return this.http.post<ResponseData<void>>(`${this.apiUrl}/unidades/registrar`, unidad);
    }

    actualizarUnidad(unidad: any): Observable<ResponseData<void>> {
        return this.http.put<ResponseData<void>>(`${this.apiUrl}/unidades/actualizar`, unidad);
    }

    deshabilitarUnidad(id: number, estatus: boolean): Observable<ResponseData<void>> {
        return this.http.put<ResponseData<void>>(`${this.apiUrl}/unidades/estatus/${id}/${estatus}`, {});
    }

    eliminarUnidad(id: number): Observable<ResponseData<void>> {
        return this.http.delete<ResponseData<void>>(`${this.apiUrl}/unidades/${id}`);
    }

    exportarUnidades(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/unidades/exportar`, { responseType: 'blob' });
    }
    removeCache(): void {
        localStorage.removeItem('unidades');
        localStorage.removeItem('unidades_timestamp');
        this.data = undefined;
        this.cacheTimestamp = undefined;
    }

    obtenerUnidadesActivas() {
        return this.http.get<ResponseData<Unidad[]>>(`${this.apiUrl}/unidades/activas`);
    }
    private leerLocalStorage(): void {
        const data = localStorage.getItem('unidades');
        const timestamp = localStorage.getItem('unidades_timestamp');
        if (data && timestamp) {
            this.data = JSON.parse(data);
            this.cacheTimestamp = parseInt(timestamp, 10);
        }
    }
}
