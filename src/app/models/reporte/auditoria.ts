import { Empleado } from '@/models/empleado/empleado';
import { Unidad } from '@/models/empresa/unidad';
import { Observacion } from './observacion';

export interface Auditoria {
    id?: number;
    folioAuditoria?: string;
    unidad?: Unidad;
    auditor?: Empleado;
    fechaAuditoria?: string;
    descripcion?: string;
    observaciones?: Observacion[];
    creado?: string;
    actualizado?: string;
}
