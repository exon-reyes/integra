import { Operatividad } from '@/models/empresa/operatividad';

export interface HorarioOperativo extends Operatividad {
    idHorario?: number;
    apertura?: string; // Puedes usar string para tiempo o Date
    cierre?: string; // Puedes usar string para tiempo o Date
}
