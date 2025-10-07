import {Routes} from '@angular/router';
import {Documentation} from '@/pages/documentation/documentation';
import {Dashboard} from '@/pages/dashboard/dashboard';
import {Landing} from '@/pages/landing/landing';
import {Notfound} from '@/pages/notfound/notfound';
import {AppLayout} from '@/layout/component/app.layout';
import ReporteRoutes from '@/routes/reporte.routes';
import SistemasRoutes from '@/routes/sistemas.routes';
import ColaboraRoutes from '@/routes/colabora.routes';
import {RolePermissionGuard} from "@/core/guards/RolePermissionGuard";

export const appRoutes: Routes = [{
    path: '',
    component: AppLayout,
    children: [{path: '', component: Dashboard}, {path: 'colabora', children: ColaboraRoutes}, {
        path: 'reporte', children: ReporteRoutes
    }, {
        path: 'empleado/admin',
        loadComponent: () => import('./app/module/empleado/admin/admin').then(value => value.Admin),
        canActivate: [RolePermissionGuard],
        data: {permission: 'ADMIN'}
    }, {
        path: 'asistencia/admin',
        loadComponent: () => import('@/module/checador/admin/admin').then(value => value.Admin),
        canActivate: [RolePermissionGuard],
        data: {permission: 'ADMIN'}
    }, {
        path: 'sucursal',
        loadComponent: () => import('@/module/unidad/unidades').then((value) => value.Unidades),
        canActivate: [RolePermissionGuard],
        data: {permission: 'ADMIN'}
    }, {
        path: 'credenciales/admin',
        loadComponent: () => import('@/module/credencial/admin').then((value) => value.Admin),
        canActivate: [RolePermissionGuard],
        data: {permission: 'ADMIN'}
    }, {path: 'sistemas', children: SistemasRoutes}, {
        path: 'usuarios', loadChildren: () => import('./app/routes/usuario.routes')
    }, {path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes')}, {
        path: 'documentation', component: Documentation
    }, {path: 'pages', loadChildren: () => import('./app/pages/pages.routes')}]
}, {path: 'landing', component: Landing}, {path: 'notfound', component: Notfound}, {
    path: 'auth', loadChildren: () => import('@/routes/auth.routes')
}, {
    path: 'checador', loadComponent: () => import('@/module/checador/app').then((value) => value.App)
}, {path: '**', redirectTo: '/notfound'}];
