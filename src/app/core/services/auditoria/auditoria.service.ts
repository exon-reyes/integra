import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';
import { Auditoria } from '../../../models/reporte/auditoria';
import { Observacion } from '../../../models/reporte/observacion';
import { CrearAuditoriaRequest } from '../../../models/auditoria/request/crear-auditoria.request';
import { FiltroObservacionRequest } from '../../../models/auditoria/request/filtro-observacion.request';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  protected http = inject(HttpClient);
  private readonly apiUrl = `${environment.integraApi}/auditoria`;

  crearAuditoria(request: CrearAuditoriaRequest) {
    return this.http.post<ResponseData<Auditoria>>(`${this.apiUrl}/crear`, request);
  }

  obtenerPorId(id: number) {
    return this.http.get<ResponseData<Auditoria>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorFolio(folio: string) {
    return this.http.get<ResponseData<Auditoria>>(`${this.apiUrl}/folio/${folio}`);
  }

  obtenerPorUnidad(idUnidad: number) {
    return this.http.get<ResponseData<Auditoria[]>>(`${this.apiUrl}/unidad/${idUnidad}`);
  }

  filtrarObservaciones(filtro) {
    return this.http.get<ResponseData<Observacion[]>>(`${this.apiUrl}/observaciones/filtrar`, {params:  {filtro}});
  }

  generarFolioSeguimiento(idArea: number) {
    return this.http.get<ResponseData<string>>(`${this.apiUrl}/folio-seguimiento/${idArea}`);
  }
}
