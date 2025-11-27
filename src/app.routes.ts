import { Routes } from '@angular/router';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { AppLayout } from '@/layout/component/app.layout';
import { LoginGuard } from '@/core/security/LoginGuard';
import { AuthGuard } from '@/core/security/AuthGuard';
import { PermissionGuard } from '@/core/security/PermissionGuard';
import { Autoridades } from '@/config/Autoridades';

export const appRoutes: Routes = [
    { path: '', canActivate: [LoginGuard], loadComponent: () => import('@/pages/landing/landing').then((value) => value.Landing) },
    {
        path: 'integra',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'general', loadChildren: () => import('./app/routes/general.routes') },
            {
                path: 'empleado/admin',
                loadComponent: () => import('./app/module/empleado/admin/admin').then((value) => value.Admin),
                canActivate: [PermissionGuard]
            },
            {
                path: 'asistencia/admin',
                loadComponent: () => import('@/module/checador/modulos/modulos').then((value) => value.Modulos),
                canActivate: [PermissionGuard]
            },
            {
                path: 'asistencia/consulta',
                loadComponent: () => import('@/module/checador/admin/admin').then((value) => value.Admin),
                canActivate: [PermissionGuard]
            },
            {
                path: 'asistencia/manual',
                loadComponent: () => import('@/module/checador/registro-manual/registro-manual').then((value) => value.RegistroManualComponent),
                canActivate: [PermissionGuard]
            },
            {
                path: 'asistencia/exportar',
                loadComponent: () => import('@/module/checador/incidencias-nomina/incidencias-nomina').then((value) => value.IncidenciasNomina),
                canActivate: [PermissionGuard]
            },
            {
                path: 'asistencia/compensacion',
                loadComponent: () => import('@/module/checador/compensaciones/compensaciones').then((value) => value.Compensaciones),
                canActivate: [PermissionGuard]
            },
            {
                path: 'asistencia/kioscos',
                loadComponent: () => import('@/module/checador/admin-kiosco/admin-kiosco').then((value) => value.AdminKiosco),
                canActivate: [PermissionGuard]
            },

            {
                path: 'credenciales/admin',
                loadComponent: () => import('@/module/credencial/admin').then((value) => value.Admin),
                canActivate: [PermissionGuard],
                data: { permission: Autoridades.CONSULTAR_CREDENCIALES }
            },
            { path: 'roles/admin', loadComponent: () => import('@/module/rol-admin/rol-admin').then((value) => value.RolAdmin), canActivate: [PermissionGuard], data: { permission: 'CA' } },
            {
                path: 'usuarios',
                canActivate: [PermissionGuard],
                data: { permission: Autoridades.VER_SUBMODULO_USUARIOS },
                loadChildren: () => import('./app/routes/usuario.routes')
            }
        ]
    },
    { path: 'notfound', loadComponent: () => import('@/pages/notfound').then((value) => value.Notfound) },
    { path: 'auth', loadChildren: () => import('@/routes/auth.routes') },
    {
        path: 'integra/checador',
        loadComponent: () => import('@/module/checador/app').then((value) => value.App)
    },
    { path: '**', redirectTo: '/notfound' }
];
