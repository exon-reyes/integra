import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('@/module/gestion-usuarios/gestion-usuarios').then((value) => value.GestionUsuarios)
    }
] as Routes;
