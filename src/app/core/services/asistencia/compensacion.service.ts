import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';

export interface CompensacionReporteQuery {
    clave: string;
    colaborador: string;
    unidad: string;
    fecha: string;
    horaSalida: string;
    horasTrabajadas: string;
    horasFaltantes: string;
    tiempoCompensado: string;
}

export interface EmpleadoReporteRequest {
    empleadoId?: number;
    desde?: string;
    hasta?: string;
    unidadId?: number;
    supervisorId?: number;
    zonaId?: number;
    puestoId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CompensacionService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.integraApi}/opentime/compensaciones`;

    obtenerCompensaciones(params) {
        return this.http.get<ResponseData<CompensacionReporteQuery[]>>(this.apiUrl, { params});
    }

    descargarExcel(params?: EmpleadoReporteRequest) {
        return this.http.get(`${this.apiUrl}/excel`, {
            responseType: 'blob',
            params: params as any
        });
    }
}
