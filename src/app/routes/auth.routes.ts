import { Routes } from '@angular/router';
import { LoginGuard } from '@/core/security/LoginGuard';

export default [
    { path: 'denied', loadComponent: () => import('@/module/seguridad/pages/denied').then((value) => value.Denied) },
    {
        path: 'login',
        loadComponent: () => import('@/module/seguridad/pages/login/login').then((value) => value.Login),
        canActivate: [LoginGuard]
    },
    {
        path: '**',
        loadComponent: () => import('@/pages/notfound').then((value) => value.Notfound)
    }
] as Routes;
