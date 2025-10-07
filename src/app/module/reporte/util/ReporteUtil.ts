import { Ticket } from '@/models/reporte/ticket';
import {Observacion} from '@/models/reporte/observacion';

export const buildCopyString = (data: Ticket): string | undefined =>
  data ? [
    data.area?.nombre ? `== REPORTE | ${data.area.nombre.toUpperCase()} ==` : '== REPORTE ==',
    data.unidad?.nombre ? `Unidad: ${data.unidad.nombre}` : null,
    data.titulo?.nombre ? `Tipo: ${data.titulo.nombre}` : null,
    data.folio ? `Folio: ${data.folio}` : null,
    data.estatus?.nombre ? `Estatus: ${data.estatus.nombre}` : null,
    data.agente ? `Atiende: ${data.agente}` : null
  ].filter(Boolean).join('\n') : undefined;

export const buildCopyObservacion = (data: Observacion): string | undefined =>
  data ? [
    data.area?.nombre ? `== SEGUIMIENTO | ${data.area.nombre.toUpperCase()} ==` : '== SEGUIMIENTO ==',
    [data.unidad?.clave, data.unidad?.nombre].filter(Boolean).join(' ') ? `Unidad: ${[data.unidad?.clave, data.unidad?.nombre].filter(Boolean).join(' ')}` : null,
    data.reporte?.nombre ? `Tipo: ${data.reporte.nombre}` : null,
    data.folio ? `Folio interno: ${data.folio}` : null,
    data.auditoria?.folioAuditoria?.trim() ? `Folio Auditoría: ${data.auditoria.folioAuditoria.trim()}` : null,
    data.estatus?.nombre ? `Estatus: ${data.estatus.nombre}` : null,
    data.empleadoReporta?.nombre ? `Atiende: ${data.empleadoReporta.nombre}` : null
  ].filter(Boolean).join('\n') : undefined;

