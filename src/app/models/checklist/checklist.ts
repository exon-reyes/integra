import { Actividad } from './actividad';

export interface Checklist {
  actividades: Actividad[];
  totalActividades: number;
  actividadesCompletadas: number;
  porcentajeCompletado: number;
}