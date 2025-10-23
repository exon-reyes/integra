import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';

export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface PermisoApi {
    id: number;
    name: string;
    description: string;
}

@Injectable({
    providedIn: 'root'
})
export class RolService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.integraApi}/acceso`;

    obtenerRoles(): Observable<ResponseData<Rol[]>> {
        return this.http.get<ResponseData<Rol[]>>(`${this.apiUrl}/roles`);
    }
    obtenerTodosLosPermisos(): Observable<ResponseData<any>> {
        return this.http.get<ResponseData<any>>(`${this.apiUrl}/permisos`);
    }
    obtenerPermisosPorRol(id: number): Observable<ResponseData<PermisoApi[]>> {
        return this.http.get<ResponseData<PermisoApi[]>>(`${this.apiUrl}/permisos/rol/${id}`);
    }
}
