export interface FiltroObservacionRequest {
  idEmpleado?: number;
  idDepartamento?: number;
  folioPrincipal?: string;
  folioSeguimiento?: string;
  estatus?: string;
  idArea?: number;
  tipoReporte?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoPanel?: 'LEVANTADOS' | 'GENERADOS' | 'INTERNOS' | 'COMPARTIDOS';
  requiereSeguimiento?: boolean;
  page?: number;
  size?: number;
}