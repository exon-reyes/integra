import {Observacion} from '@/models/auditoria/response/observacion';
import {Checklist} from '@/models/checklist/checklist';
import {SeguimientoObservacion} from '@/models/auditoria/response/SeguimientoObservacion';

export interface DetallesCompletos {
  observacion?: Observacion;
  seguimientos?: SeguimientoObservacion[];
  checklist?: Checklist;
}
