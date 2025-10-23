import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';
import { Puesto } from '@/models/empresa/puesto';

export interface Empleado {
    id: number;
    codigo: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
}

export interface Unidad {
    clave: string;
    nombre: string;
}

export interface Pausa {
    id: number;
    inicioPausa: string;
    finPausa?: string;
    tipo: string;
}

export interface Asistencia {
    id: number;
    fecha: string;
    inicioJornada: string;
    finJornada?: string;
    jornadaCerrada: boolean;
    cerradoAutomatico?: boolean;
    tiempoCompensado?: string;
    pausas: Pausa[];
    diferencia8HorasTrabajadasFormateada: string;
    fueAsistenciaNocturna?: boolean;
    horasNetasTrabajadas: {
        minutos: number;
        horas: number;
        minutosRestantes: number;
    };
}

export interface EmpleadoReporte {
    id: number;
    empleado: Empleado;
    unidad: Unidad;
    puesto: Puesto;
    asistencias: Asistencia[];
    sumatoriaTiempoTrabajado: number;
    sumatoriaTiempoExtras: number;
}
export interface EmpleadoReporteRequest {
    empleadoId?: number;
    desde?: string; // o Date, dependiendo de cómo manejes las fechas
    hasta?: string; // (si usas Date, convierte antes de enviar)
    unidadId?: number;
    zonaId?: number;
    supervisorId?: number;
    diasTrabajados?: number;
    puestoId?: number;
}
@Injectable({
    providedIn: 'root'
})
export class AsistenciaService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.integraApi}/asistencia/reporte`;

    get apiUrlImagen(): string {
        return this.apiUrl;
    }

    obtenerAsistencias(params) {
        return this.http.get<ResponseData<EmpleadoReporte[]>>(`${this.apiUrl}/asistencias`, { params: params });
    }

    descargarExcel(params?: any) {
        return this.http.get(`${this.apiUrl}/asistencias/detallado/excel`, {
            responseType: 'blob',
            params: params
        });
    }
    obtenerInconsistencias(params?: any) {
        return this.http.get<ResponseData<any>>(`${this.apiUrl}/inconsistencias`, { params: params });
    }
}
