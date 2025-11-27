// import { Routes } from '@angular/router';
// import { RolePermissionGuard } from '@/core/guards/RolePermissionGuard';
//
// export default [
//     {
//         path: '',
//         loadComponent: () => import('@/module/colaboracion/colabora/pages/admin/panel').then((value) => value.Panel),
//         canActivate: [RolePermissionGuard],
//         data: { permission: 'OBS_SHARED' }
//     },
//     {
//         path: 'observaciones',
//         loadComponent: () => import('@/module/colaboracion/observaciones/pages/admin/panel').then((value) => value.Panel),
//         canActivate: [RolePermissionGuard],
//         data: { permission: 'OBS_R' }
//     },
//     {
//         path: 'observaciones/:id',
//         loadComponent: () => import('@/module/colaboracion/observaciones/pages/detalles/detalles').then((value) => value.Detalles),
//         canActivate: [RolePermissionGuard],
//         data: { permission: 'OBS_R' }
//     }
// ] as Routes;
