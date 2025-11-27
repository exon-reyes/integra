import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { HasPermissionDirective } from '@/core/security/HasPermissionDirective';
import { Autoridades } from '@/config/Autoridades';

/*
* // Single permission
{ label: 'Item', permission: 'crear_usuario' }

// Multiple permissions with OR (default)
{ label: 'Item', permission: ['crear_usuario', 'editar_usuario'] }

// Multiple permissions with AND
{ label: 'Item', permission: ['ver_reportes', 'exportar_datos'], permissionOperator: 'AND' }
*/
export interface CustomMenuItem extends MenuItem {
    permission?: string | string[];
    permissionOperator?: 'AND' | 'OR';
    items?: CustomMenuItem[];
}
@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, HasPermissionDirective],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <ng-container *ngIf="!item.separator">
                    <div *hasPermission="item.permission; operator: item.permissionOperator || 'OR'">
                        <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                    </div>
                </ng-container>

                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit {
    model: CustomMenuItem[] = [];
    ngOnInit() {
        this.model = [
            {
                label: 'Panel Principal',
                items: [{ label: 'Vista General', icon: 'isc i-layout', routerLink: ['/integra'] }]
            },
            {
                label: 'Generales',
                permission: Autoridades.VER_MODULO_GENERALES,
                items: [
                    {
                        label: 'Unidades',
                        permission: Autoridades.VER_SUBMODULO_UNIDADES,
                        routerLink: ['general/unidades'],
                        icon: 'isc i-contact'
                    }
                ]
            },
            {
                label: 'GESTIÓN RRHH',
                permission: Autoridades.VER_MODULO_RRHH,
                icon: 'isc i-member',
                items: [
                    { label: 'Empleados', permission: Autoridades.VER_SUBMODULO_EMPLEADOS, icon: 'isc i-member', routerLink: ['rrhh/empleados'] },
                    {
                        label: 'Gestión de asistencia',
                        permission: Autoridades.VER_SUBMODULO_INFORME_ASISTENCIA,
                        icon: 'isc i-schedule',
                        routerLink: ['asistencia/admin']
                        // items: [
                        //     { label: 'Reloj Checador', permission: Autoridades.ACCESO_RELOJ_CHECADOR, icon: 'isc i-reloj', routerLink: ['checador'] },
                        //     { label: 'Informe de asistencia', permission: Autoridades.VER_SUBMOD_INFORME_ASISTENCIA, icon: 'isc i-schedule', routerLink: ['asistencia/admin'] },
                        //     { label: 'Configuración reloj', permission: Autoridades.VER_SUBMOD_CONFIG_OPENTIME, icon: 'isc i-timelimit', routerLink: ['asistencia/kioscos'] },
                        //     { label: 'Compensaciones', permission: Autoridades.VER_SUBMOD_COMPENSACIONES, icon: 'isc i-expired', routerLink: ['asistencia/compensacion'] }
                        // ]
                    }
                ]
            },
            {
                label: 'INFRAESTRUCTURA TI',
                permission: Autoridades.VER_MODULO_INFRAESTRUCTURA,
                items: [
                    { label: 'Gestión de Credenciales', permission: Autoridades.VER_SUBMODULO_CREDENCIALES, routerLink: ['credenciales/admin'], icon: 'isc i-keypass' },
                    { label: 'Gestión de Roles', permission: Autoridades.VER_SUBMODULO_ROLES, routerLink: ['roles/admin'], icon: 'isc i-exchange' },
                    { label: 'Gestión de usuarios', permission: Autoridades.VER_SUBMODULO_USUARIOS, routerLink: ['usuarios'], icon: 'isc i-user' }
                ]
            }
        ];
    }
}
