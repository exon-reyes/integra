import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ResponseData } from '@/core/responseData';
import { AbstractService } from '@/core/services/abstract-service';
import { Observable } from 'rxjs';
import { Usuario } from '@/models/usuario/usuario';
import { CreateUserRequest } from '@/models/usuario/create-user-request';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService extends AbstractService {
    private readonly apiUrl = `${environment.integraApi}/usuarios`;

    obtenerUsuarios(): Observable<ResponseData<Usuario[]>> {
        console.log('Consultando usuarios');
        return this.http.get<ResponseData<Usuario[]>>(this.apiUrl);
    }
    actualizarPermisosEspeciales(userId: number, permisos: string[]): Observable<ResponseData<any>> {
        const url = `${this.apiUrl}/${userId}/permisos-especiales`;
        return this.http.put<ResponseData<any>>(url, permisos);
    }
    obtenerPrivilegios(userId: number): Observable<ResponseData<Usuario>> {
        return this.http.get<ResponseData<Usuario>>(`${this.apiUrl}/${userId}/permisos`);
    }

    actualizarEstatus(userId: number, activo: boolean): Observable<ResponseData<string>> {
        return this.http.put<ResponseData<string>>(`${this.apiUrl}/${userId}/estatus?activo=${activo}`, {});
    }

    eliminarUsuario(userId: number): Observable<ResponseData<any>> {
        return this.http.delete<ResponseData<any>>(`${this.apiUrl}/${userId}`);
    }

    crearUsuario(userData: CreateUserRequest): Observable<ResponseData<any>> {
        return this.http.post<ResponseData<any>>(this.apiUrl, userData);
    }
}
