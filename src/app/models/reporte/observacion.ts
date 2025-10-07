import {Area} from '@/models/area/area';
import {Empleado} from '@/models/empleado/empleado';
import {SeguimientoObservacion} from './seguimiento-observacion';
import {ArchivoObservacion} from './archivo-observacion';
import {Reporte} from '@/models/reporte/reporte';
import {Estatus} from '@/models/reporte/estatus';
import {Auditoria} from '@/models/reporte/auditoria';
import {Unidad} from '@/models/empresa/unidad';

export interface Observacion {
  id?: number;
  folio?: string;
  area?: Area;
  unidad?: Unidad;
  reporte?: Reporte;
  auditoria?: Auditoria;
  descripcion?: string;
  estatus?: Estatus;
  requiereSeguimiento?: boolean;
  esInterno?: boolean;
  empleadoReporta?: Empleado;
  seguimientos?: SeguimientoObservacion[];
  archivos?: ArchivoObservacion[];
  creado?: string;
  actualizado?: string;
  generadoPor?: string;
  urlArchivo?: string;
  nombreArchivo?: string;
}
