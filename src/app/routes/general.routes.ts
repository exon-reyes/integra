import { Routes } from '@angular/router';
import { Autoridades } from '@/config/Autoridades';
import { PermissionGuard } from '@/core/security/PermissionGuard';

export default [
    {
        path: 'unidades',
        canActivate: [PermissionGuard],
        data: { permission: Autoridades.VER_SUBMODULO_UNIDADES },
        loadComponent: () => import('@/module/unidad/unidades').then((value) => value.Unidades)
    }
] as Routes;
