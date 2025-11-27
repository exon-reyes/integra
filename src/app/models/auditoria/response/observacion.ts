import { Unidad } from '@/models/empresa/unidad';
import { Departamento } from '@/models/empresa/departamento';
import { Auditoria } from '@/models/reporte/auditoria';

export interface Observacion {
    id: number;
    unidadReportada?: Unidad;
    departamentoGenera?: Departamento;
    auditoriaAsociada?: Auditoria;
    seguimientos?: [];
    reporte: {
        id?: number;
        nombre?: string;
        folioSeguimiento?: string;
        estatus?: {
            id?: number;
            nombre?: string;
        };
        generadoPor?: {
            id?: number;
            nombre?: string;
        };
        descripcion?: string;
        areaResponsable: {
            id?: number;
            nombre?: string;
        };
        fechaCreacion?: Date;
        nombreArchivo?: string;
        urlArchivo?: string;
    };
    // folioSeguimiento: string;
    // idArea: number;
    // nombreArea: string;
    // idDepartamento: number;
    // nombreDepartamento: string;
    // idTipoReporte: number;
    // nombreTipoReporte: string;
    // descripcion: string;
    // requiereSeguimiento: boolean;
    // estatus: string;
    // fechaCreacion: Date; // O Date, dependiendo de cómo manejes las fechas
    // archivos: string[];
    // esCompartida: boolean;
    // compartidoPor: string;
}
