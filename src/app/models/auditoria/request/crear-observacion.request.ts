export interface CrearObservacionRequest {
  idArea: number;
  tipoReporte: string;
  descripcion: string;
  requiereSeguimiento: boolean;
  esInterno: boolean;
  folioSeguimiento?: string;
}