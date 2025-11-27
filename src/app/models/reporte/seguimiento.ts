import { Estatus } from '@/models/reporte/estatus';
import { Ticket } from '@/models/reporte/ticket';

export interface Seguimiento {
    id: number;
    ticket: Ticket;
    estatus: Estatus;
    agente: string;
    descripcion: string;
    creado: string;
    rutaArchivo?: string;
    urlArchivo?: string;
    nombreArchivo?: string;
}
