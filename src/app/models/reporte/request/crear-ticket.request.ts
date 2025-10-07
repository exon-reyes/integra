export interface CrearTicketRequest {
  agente?: string;    // Opcional
  idEstatus?: number; // Opcional
  idReporte: number;  // Obligatorio
  idUnidad: number;   // Obligatorio
  idDepartamentoGenera:number;
  descripcion?: string; // Opcional
  folio?: string;      // Opcional
  publicar?: boolean;  // Opcional
}
