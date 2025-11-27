import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { JWTService } from '@/core/security/JWTService';
import { AbstractService } from '@/core/services/abstract-service';
import { environment } from '@env/environment';

export interface LoginResponse {
    token: string;
    message: string;
    uiPermissions: string[];
}
@Injectable({
    providedIn: 'root'
})
export class LoginService extends AbstractService {
    private readonly apiUrl = `${environment.integraApi}/auth`;
    private readonly jwtService = inject(JWTService);
    constructor() {
        super();
    }
    login(credentials: any) {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((res) => {
                this.jwtService.setToken(res.token);
                this.jwtService.setUiPermissions(res.uiPermissions);
            })
        );
    }
}
