import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '@/core/services/auth/AuthService';

@Injectable({
    providedIn: 'root'
})
export class RolePermissionGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/auth/login']);
            return false;
        }

        const authorities = this.authService.getAuthorities();
        
        // Roles o permisos requeridos definidos en data de la ruta
        const requiredRole: string | undefined = route.data['role'];
        const requiredPermission: string | undefined = route.data['permission'];

        // Validación de rol
        if (requiredRole && authorities.includes(requiredRole)) {
            return true;
        }

        // Validación de permiso
        if (requiredPermission && authorities.includes(requiredPermission)) {
            return true;
        }

        // Si no tiene ni rol ni permiso requerido, denegar acceso
        this.router.navigate(['/auth/access']);
        return false;
    }
}
