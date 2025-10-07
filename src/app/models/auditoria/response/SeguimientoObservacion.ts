import {Estatus} from '@/models/reporte/estatus';

export interface SeguimientoObservacion {
    id: number;
    estatus: Estatus;
    atiende?: string;
    descripcion?: string;
    fechaCreacion?:string;
    generadoPor?:string;
    rutaArchivo?:string;
    urlArchivo?: string;
    nombreArchivo?:string;
}
