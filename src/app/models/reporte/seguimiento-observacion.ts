import { Empleado } from '@/models/empleado/empleado';
import { ArchivoSeguimiento } from './archivo-seguimiento';

export interface SeguimientoObservacion {
  id?: number;
  empleado?: Empleado;
  comentario?: string;
  estatusAnterior?: string;
  estatusNuevo?: string;
  archivos?: ArchivoSeguimiento[];
  creado?: string;
}
