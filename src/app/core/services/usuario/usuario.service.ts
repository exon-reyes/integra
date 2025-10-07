import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ResponseData } from '@/shared/util/responseData';
import { Usuario } from '@/models/usuario/usuario';
import { AbstractService } from '@/shared/service/abstract-service';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService extends AbstractService{
    private readonly apiUrl = `${environment.integraApi}/usuarios`;

    constructor() {
        super()
    }

    obtenerUsuarios() {
        console.log("Consultando")
        return this.http.get<ResponseData<Usuario[]>>(this.apiUrl);
    }
}
