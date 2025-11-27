import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface UserPrincipal {
    username: string;
    id: number;
    email: string;
    name?: string;
    sup?: boolean;
    empleadoId?: number;
    authorities: string[]; // roles + permisos especiales del JWT
    uiPermissions: string[]; // todos los permisos para UI
    enabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class JWTService {
    private readonly _TOKEN_KEY = 'jwt_token';
    private _cachedUiPermissions: string[] | null = null;
    private _cachedToken: string | null = null;

    constructor(private http: HttpClient) {
        this.loadUiPermissionsToCache();
        this.loadTokenToCache();
    }

    setToken(token: string): void {
        localStorage.setItem(this._TOKEN_KEY, token);
        this._cachedToken = token;
    }

    getToken(): string | null {
        if (this._cachedToken === null) {
            this.loadTokenToCache();
        }
        return this._cachedToken;
    }
    hasAuthority(authority: string): boolean {
        if (this._cachedUiPermissions === null) {
            this.loadUiPermissionsToCache();
        }
        return this._cachedUiPermissions?.includes(authority) || false;
    }
    removeToken(): void {
        localStorage.removeItem(this._TOKEN_KEY);
        this._cachedToken = null;
        this.clearUiPermissions();
    }

    isTokenExpired(token?: string): boolean {
        const t = token || this.getToken();
        if (!t) return true;

        try {
            const payload = this.decodePayload(t);
            const exp = payload?.exp;
            return !exp || Date.now() >= exp * 1000;
        } catch {
            return true;
        }
    }

    decodePayload(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('JWT inválido');
        return JSON.parse(atob(parts[1]));
    }

    getUser(): UserPrincipal | null {
        const token = this.getToken();
        if (!token || this.isTokenExpired(token)) return null;

        try {
            const payload = this.decodePayload(token);
            const storedUiPermissions = this.getStoredUiPermissions();

            return {
                username: payload.username,
                id: payload.id,
                email: payload.email,
                name: payload.name,
                empleadoId: payload.empleadoId,
                sup: payload.sup,
                authorities: payload.authorities || [],
                uiPermissions: storedUiPermissions || [],
                enabled: payload.enabled ?? true
            };
        } catch {
            return null;
        }
    }

    getAuthorities(): string[] {
        const user = this.getUser();
        return user?.authorities || [];
    }
    setUiPermissions(permissions: string[]): void {
        localStorage.setItem('ui_permissions', JSON.stringify(permissions));
        this._cachedUiPermissions = permissions;
    }

    clearUiPermissions(): void {
        localStorage.removeItem('ui_permissions');
        this._cachedUiPermissions = null;
    }

    isTokenExpiringSoon(secondsThreshold = 300): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = this.decodePayload(token);
            const exp = payload.exp;
            if (!exp) return false;
            return exp * 1000 - Date.now() <= secondsThreshold * 1000;
        } catch {
            return false;
        }
    }

    /** NUEVO: refresh automático del JWT si está próximo a expirar */
    refreshTokenIfNeeded(): Observable<string | null> {
        const token = this.getToken();
        if (!token || !this.isTokenExpiringSoon()) {
            return of(token);
        }

        // Llamada real al endpoint de refresh
        return this.http.post<{ token: string }>('/auth/refresh-token', {}).pipe(
            map((res) => {
                if (res?.token) {
                    this.setToken(res.token);
                    return res.token;
                }
                return null;
            }),
            catchError(() => {
                this.removeToken();
                return of(null);
            })
        );
    }

    redirectToLogin(): void {
        window.location.href = 'auth/login';
    }

    refreshToken(): Observable<string | null> {
        // Aquí NO verificamos si expira pronto, simplemente forzamos el refresh
        return this.http.post<{ token: string }>('/auth/refresh-token', {}).pipe(
            map((res) => {
                if (res?.token) {
                    this.setToken(res.token);
                    return res.token;
                }
                return null;
            }),
            catchError(() => {
                this.removeToken();
                debugger;
                return of(null);
            })
        );
    }

    /** Opcional: alias para limpiar token */
    clearToken(): void {
        this.removeToken();
    }

    private getStoredUiPermissions(): string[] {
        const stored = localStorage.getItem('ui_permissions');
        return stored ? JSON.parse(stored) : [];
    }

    private loadUiPermissionsToCache(): void {
        const stored = localStorage.getItem('ui_permissions');
        this._cachedUiPermissions = stored ? JSON.parse(stored) : [];
    }

    private loadTokenToCache(): void {
        this._cachedToken = localStorage.getItem(this._TOKEN_KEY);
    }
}
