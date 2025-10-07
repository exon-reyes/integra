export interface Actividad {
  id?: number | null;
  descripcion: string;
  completada: boolean;
  fechaCreacion?: string;
  fechaCompletado?: string | null;
  orden?: number;
}