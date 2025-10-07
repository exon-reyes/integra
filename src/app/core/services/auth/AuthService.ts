import {Injectable} from '@angular/core';
import {tap} from 'rxjs/operators';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {environment} from '@env/environment';
import {Observable, Subject} from 'rxjs';
import {AbstractService} from '@/shared/service/abstract-service';

@Injectable({providedIn: 'root'})
export class AuthService extends AbstractService {
    private tokenKey = 'jwt';
    private api = environment.integraApi + '/auth';
    private tokenExpiringSoonSubject = new Subject<void>();

    constructor() {
        super();
    }

    get tokenExpiringSoon$(): Observable<void> {
        return this.tokenExpiringSoonSubject.asObservable();
    }

    getDepartmentId(): number | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const payload: any = jwtDecode(token);
            // El backend debe incluir 'idDepartamento' en el payload del JWT
            return payload.idDepartamento || null;
        } catch {
            // Manejar errores si el token es inválido o no se puede decodificar
            return null;
        }
    }

    login(credentials) {
        return this.http.post<{
            success: boolean;
            data: {
                token: string;
                expiresAt: string;
                authorities: string[];
            };
            message: string;
        }>(`${this.api}/login`, credentials)
            .pipe(tap((res) => {
                localStorage.setItem(this.tokenKey, res.data.token);
                localStorage.setItem('authorities', JSON.stringify(res.data.authorities));
                localStorage.setItem('expiresAt', res.data.expiresAt);
            }));
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('authorities');
        localStorage.removeItem('expiresAt');
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;
        return !this.isTokenExpired(token);
    }

    getAuthorities(): string[] {
        const authorities = localStorage.getItem('authorities');
        if (authorities) {
            return JSON.parse(authorities);
        }
        // Fallback: decodificar del token si no está en localStorage
        const token = this.getToken();
        if (!token) return [];
        const payload: any = jwtDecode(token);
        return payload.authorities || payload.permissions || [];
    }

    hasAuthority(authority: string): boolean {
        const authorities = this.getAuthorities();
        return authorities.includes(authority);
    }

    isTokenExpired(token?: string): boolean {
        if (!token) {
            token = this.getToken() || '';
        }
        if (!token) return true;

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const now = Math.floor(Date.now() / 1000);
            return (decoded.exp ?? 0) < now;
        } catch {
            return true;
        }
    }

    isTokenExpiringSoon(thresholdMinutes: number = 5, token?: string): boolean {
        if (!token) {
            token = this.getToken() || '';
        }
        if (!token) return false;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (!decoded.exp) return false;
            const now = Math.floor(Date.now() / 1000);
            const diff = (decoded.exp - now) / 60; // minutos restantes
            return diff > 0 && diff <= thresholdMinutes;
        } catch {
            return false;
        }
    }

    notifyTokenExpiringSoon() {
        this.tokenExpiringSoonSubject.next();
    }

    refreshToken() {
        const currentToken = this.getToken();
        if (!currentToken) {
            throw new Error('No token available for refresh');
        }
        
        return this.http
            .post<{
                success: boolean;
                data: {
                    token: string;
                    expiresAt: string;
                    authorities: string[];
                };
                message: string;
            }>(`${this.api}/refresh`, { token: currentToken })
            .pipe(tap((res) => {
                localStorage.setItem(this.tokenKey, res.data.token);
                localStorage.setItem('authorities', JSON.stringify(res.data.authorities));
                localStorage.setItem('expiresAt', res.data.expiresAt);
            }));
    }

    getUserId() {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const payload: any = jwtDecode(token);
            // El backend debe incluir 'idDepartamento' en el payload del JWT
            return payload.idUsuario || null;
        } catch {
            // Manejar errores si el token es inválido o no se puede decodificar
            return null;
        }
    }

    getExpiresAt(): string | null {
        return localStorage.getItem('expiresAt');
    }
}
