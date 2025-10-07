import {Folio} from '@/models/observacion/folio';
import {Unidad} from '@/models/empresa/unidad';
import {Estatus} from '@/models/reporte/estatus';
import {Departamento} from "@/models/empresa/departamento";
import {Empleado} from "@/models/empleado/empleado";
import {Reporte} from "@/models/reporte/reporte";

export interface Observacion {
    id?: number;
    folio?: Folio;
    titulo?: string;
    tipoObservacion?: Reporte;
    descripcion?: string;
    unidadReportada?: Unidad;
    fechaCreacion?: Date;
    prioridad?: string;
    estatus?: Estatus;
    departamentoOrigen?: Departamento;
    departamentoResponsable?: Departamento;
    usuarioCreador?: Empleado
    visibleParaUnidad?: boolean;
}
