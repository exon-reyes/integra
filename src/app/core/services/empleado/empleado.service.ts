import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';
import { Empleado } from '@/models/empleado/empleado';

@Injectable({
    providedIn: 'root'
})
export class EmpleadoService {
    private readonly apiUrl: string = `${environment.integraApi}/empleados`;

    constructor(private httpClient: HttpClient) {}

    obtenerEmpleados(idPuesto: number, estatus: string) {
        return this.httpClient.get<ResponseData<Empleado[]>>(`${this.apiUrl}`, {
            params: { idPuesto, estatus }
        });
    }

}
