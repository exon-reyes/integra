export interface SeguimientoCreateCmd {
  agente?: string;        // Opcional
  estatus?: string;     // Obligatorio
  descripcion?: string;    // Opcional
  idTicket: number;      // Obligatorio
}
