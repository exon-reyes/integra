import { Routes } from '@angular/router';
import { RolePermissionGuard } from '@/core/guards/RolePermissionGuard';

export default [
    {
        path: 'cuenta-prov',
        loadComponent: () => import('@/module/cuentas/pages/proveedor/account-dashboard').then((value) => value.AccountDashboard),
        canActivate: [RolePermissionGuard],
        data: { permission: 'CS_PROV' }
    },
    {
        path: 'app/:id',
        loadComponent: () => import('@/module/cuentas/pages/credenciales/account.component').then((value) => value.AccountComponent),
        canActivate: [RolePermissionGuard],
        data: { permission: 'CS_PROV' }
    }
] as Routes;
