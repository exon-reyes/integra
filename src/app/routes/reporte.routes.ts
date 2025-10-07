import { Routes } from '@angular/router';
import { RolePermissionGuard } from '@/core/guards/RolePermissionGuard';

export default [
    {
        path: '',
        loadComponent: () => import('@/module/reporte/pages/admin-panel/AdminPanel').then((value) => value.AdminPanel),
        canActivate: [RolePermissionGuard],
        data: { permission: 'TKT_R' }
    },
    {
        path: 'detalles/:folio',
        loadComponent: () => import('@/module/reporte/pages/detalles/DetallesReporte').then((value) => value.DetallesReporte),
        canActivate: [RolePermissionGuard],
        data: { permission: 'TKT_R' }
    },
    {
        path: 'ticket/add',
        loadComponent: () => import('@/module/reporte/pages/registrar-ticket/registrar-ticket.component').then((value) => value.RegistrarTicketComponent),
        canActivate: [RolePermissionGuard],
        data: { permission: 'TKT_C' }
    },
    {
        path: 'account',
        loadComponent: () => import('@/module/cuentas/pages/proveedor/account-dashboard').then((value) => value.AccountDashboard),
        canActivate: [RolePermissionGuard],
        data: { permission: 'ACCOUNT_ACCESS' }
    },
    {
        path: 'account/app/:id',
        loadComponent: () => import('@/module/cuentas/pages/credenciales/account.component').then((value) => value.AccountComponent),
        canActivate: [RolePermissionGuard],
        data: { permission: 'ACCOUNT_ADMIN' }
    }
] as Routes;
