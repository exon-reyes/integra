// ... (importaciones y código anterior)

import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Empleado} from "@/core/services/checador/Empleado";
import {TipoPausa} from "@/core/services/checador/TipoPausa";
import {environment} from "@env/environment";
import {ApiResponse} from './ApiResponse'

@Injectable({
  providedIn: 'root'
})
export class WorktimeService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.integraApi}/asistencia`;

  consultarEmpleadoPorNip(nip: string): Observable<ApiResponse<Empleado>> {
    return this.http.get<ApiResponse<Empleado>>(`${this.apiUrl}/${nip}`);
  }

  iniciarJornada(empleadoId: number, fotoBase64: string): Observable<ApiResponse<any>> {
    return this.enviarAccion('iniciar', { empleadoId, foto: fotoBase64 });
  }

  finalizarJornada(empleadoId: number, fotoBase64: string): Observable<ApiResponse<any>> {
    return this.enviarAccion('finalizar', { empleadoId, foto: fotoBase64 });
  }

  iniciarPausa(empleadoId: number, tipoPausa: TipoPausa, fotoBase64: string): Observable<ApiResponse<any>> {
    return this.enviarAccion('pausa/iniciar', { empleadoId, pausa: tipoPausa, foto: fotoBase64 });
  }

  finalizarPausa(empleadoId: number, tipoPausa: TipoPausa, fotoBase64: string): Observable<ApiResponse<any>> {
    return this.enviarAccion('pausa/finalizar', { empleadoId, pausa: tipoPausa, foto: fotoBase64 });
  }

  private enviarAccion(endpoint: string, body: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${endpoint}`, body);
  }
}
