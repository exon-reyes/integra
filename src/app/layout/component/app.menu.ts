import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { HasPermissionDirective } from '@/shared/directive/has-permission.directive';
// 💡 CustomMenuItem now includes the 'permission' property
export interface CustomMenuItem extends MenuItem {
    permission?: string;
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
                    <ng-container *hasPermission="item.permission">
                        <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                    </ng-container>
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
                items: [{ label: 'Vista General', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },

            {
                label: 'Generales',
                items: [{ label: 'Unidades', routerLink: ['/sucursal'],icon:'isc i-contact' }]
            },
            {
                label: 'GESTIÓN RRHH',
                icon: 'isc i-member',
                items: [
                    { label: 'Empleados', icon:'isc i-member', routerLink: ['/empleado/admin'] },
                    { label: 'Informe de asistencia', icon: 'isc i-schedule', routerLink: ['/asistencia/admin'] },
                    { label: 'Config. OpenTime', icon: 'isc i-timelimit', routerLink: ['/asistencia/kioscos'] },
                    { label: 'Compensaciones', icon: 'isc i-expired', routerLink: ['/asistencia/compensacion'] },
                    { label: 'Reloj Checador', icon: 'isc i-reloj', routerLink: ['/checador'] }
                ]
            },
            {
                label: 'INFRAESTRUCTURA TI',
                items: [
                    { label: 'Gestión de Credenciales', routerLink: ['/credenciales/admin'] ,icon:'isc i-keypass'},
                    { label: 'Gestión de Roles', routerLink: ['/roles/admin'],icon: 'isc i-exchange' }
                ]
            }
        ];
    }
}
