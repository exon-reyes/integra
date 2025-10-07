import { CrearObservacionRequest } from './crear-observacion.request';

export interface CrearAuditoriaRequest {
  folioPrincipal: string;
  idUnidad: number;
  idAuditor: number;
  fechaAuditoria: string;
  descripcion?: string;
  observaciones: CrearObservacionRequest[];
}