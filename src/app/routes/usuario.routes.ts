import { Routes } from '@angular/router';
import { RolePermissionGuard } from '@/core/guards/RolePermissionGuard';

export default [
    {
        path: '',
        loadComponent: () => import('@/module/seguridad/pages/usuarios/usuarios.component').then((value) => value.UsuariosComponent),
        canActivate: [RolePermissionGuard],
        data: { permission: 'USR_R' }
    },{
        path: 'rol',
        loadComponent: () => import('@/module/seguridad/pages/roles/roles.component').then((value) => value.RolesComponent),
        canActivate: [RolePermissionGuard],
        data: { permission: 'ROL_R' }
    }
] as Routes;
