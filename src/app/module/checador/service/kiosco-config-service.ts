import { Injectable } from '@angular/core';
import { AbstractService } from '@/shared/service/abstract-service';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';
import { HttpParams } from '@angular/common/http';
import { Unidad } from '@/models/empresa/unidad';

@Injectable({
    providedIn: 'root'
})
export class KioscoConfigService extends AbstractService {
    private readonly apiUrl = `${environment.integraApi}/kioscos`;
    constructor() {
        super();
    }
    obtenerUnidadesKiosco() {
        return this.http.get<ResponseData<Unidad[]>>(this.apiUrl);
    }
    actualizarUsoCamara(id: number, estatus: boolean) {
        const params = new HttpParams().set('estatus', estatus.toString());
        return this.http.patch<ResponseData<void>>(`${this.apiUrl}/${id}/camara`, {}, { params });
    }
    obtenerUnidadKiosco(id: number) {
        return this.http.get<ResponseData<Unidad>>(`${this.apiUrl}/${id}`);
    }
    solicitarCodigo(id: number) {
        return this.http.patch<ResponseData<void>>(`${this.apiUrl}/${id}/requiere-codigo`, {});
    }
    generarCodigoConfigUnSoloUso(id: number) {
        return this.http.patch<ResponseData<string>>(`${this.apiUrl}/${id}/codigo`, {});
    }
    cancelarCodigo(id: number) {
        return this.http.delete<ResponseData<void>>(`${this.apiUrl}/${id}/requiere-codigo`, {});
    }
    usarCodigoConfiguracion(id: number, codigo: string) {
        return this.http.post<ResponseData<void>>(`${this.apiUrl}/${id}/codigos/${codigo}/usar`, {});
    }
}
