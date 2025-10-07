import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { ResponseData } from '@/shared/util/responseData';
import { InfoBasicaEmpleado } from '@/models/organizacion/empleado';
import { Empleado } from '@/models/empleado/empleado';

@Injectable({
    providedIn: 'root'
})
export class EmpleadoService {
    private readonly apiUrl = `${environment.integraApi}/empleados`;
    private readonly header: HttpHeaders;
    private data!: ResponseData<InfoBasicaEmpleado[]>;
    private datSoloEmpleados!: ResponseData<InfoBasicaEmpleado[]>;

    constructor(private httpClient: HttpClient) {
        this.header = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    obtenerEmpleados() {
        if (this.data) {
            return of(this.data);
        } else {
            return this.httpClient.get<ResponseData<InfoBasicaEmpleado[]>>(`${this.apiUrl}`, { headers: this.header }).pipe(tap((data) => (this.data = data)));
        }
    }
    obtenerSoloEmpleados() {
        if (this.datSoloEmpleados) {
            return of(this.datSoloEmpleados);
        } else {
            return this.httpClient.get<ResponseData<InfoBasicaEmpleado[]>>(`${this.apiUrl}/nombres`, { headers: this.header }).pipe(tap((data) => (this.datSoloEmpleados = data)));
        }
    }
    removeCache() {
        this.data = undefined as any;
        this.datSoloEmpleados = undefined as any;
    }
}
