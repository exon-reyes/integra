import { Reporte } from '@/models/reporte/reporte';

export interface Area {
    id?: number;
    nombre?: string;
    externo?: boolean;
    generarFolio?: boolean;
    reportes?: Reporte[];
    idDepartamento?: number;
}
