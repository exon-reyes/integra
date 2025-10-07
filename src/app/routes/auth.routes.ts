import { Routes } from '@angular/router';
import { LoginGuard } from '@/core/guards/LoginGuard';
import { Access } from '@/module/seguridad/pages/access';
import { Error } from '@/module/seguridad/pages/error';
import { Login } from '@/module/seguridad/pages/login/login';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    {
        path: 'login',
        component: Login,
        canActivate: [LoginGuard]
    }
] as Routes;
