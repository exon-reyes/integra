import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Modulo, Rol } from '@/models/seguridad/rol';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';

@Injectable({
    providedIn: 'root'
})
export class RolService {
    private readonly apiUrl: string = `${environment.integraApi}/modulos`;

    constructor(private http: HttpClient) {}

    obtenerRoles(): Observable<ResponseData<Rol[]>> {
        return this.http.get<ResponseData<Rol[]>>(`${this.apiUrl}`);
    }

    obtenerModulos(): Observable<ResponseData<Modulo[]>> {
        return this.http.get<ResponseData<Modulo[]>>(`${this.apiUrl}`);
    }

    actualizarPermisos(rolId: number, permisoIds: number[]): Observable<ResponseData<any>> {
        return this.http.put<ResponseData<any>>(`${this.apiUrl}/${rolId}/permisos`, { permisoIds });
    }
}
