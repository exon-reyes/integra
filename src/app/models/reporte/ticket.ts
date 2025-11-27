import { Empleado } from '@/models/empleado/empleado';
import { Unidad } from '@/models/empresa/unidad';
import { Reporte } from '@/models/reporte/reporte';
import { Estatus } from '@/models/reporte/estatus';
import { Seguimiento } from '@/models/reporte/seguimiento';
import { Area } from '@/models/area/area';

export interface Ticket {
    id?: number;
    unidad?: Unidad;
    titulo?: Reporte;
    descripcion?: string;
    folio?: string;
    agente?: string;
    publicar?: boolean;
    estatus?: Estatus;
    compartir?: Empleado[];
    creado?: string; // Puedes usar string para fechas o Date
    actualizado?: string; // Puedes usar string para fechas o Date
    seguimientos?: Seguimiento[];
    area?: Area;
    rutaArchivo?: string;
    urlArchivo?: string;
    nombreArchivo?: string;
}
