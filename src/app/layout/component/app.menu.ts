import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {AppMenuitem} from './app.menuitem';

@Component({
    selector: 'app-menu', standalone: true, imports: [CommonModule, AppMenuitem, RouterModule], template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [{
            label: 'Home', items: [{label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/']}]
        }, {
            label: 'Módulo',items:[{
               label:'Admin. de unidades',
               icon:'isc isc-company',
               routerLink: ['/sucursal']
            },{
                label: 'Empleados',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/empleado/admin']
            },{
                label:'Credenciales',
                icon:'pi pi-fw pi-key',
                routerLink: ['/credenciales/admin']
            }],

        },{
            label:'Asistencia'
            ,items:[{
                label:'Checador',
                icon:'pi pi-fw pi-clock',
                routerLink: ['/checador']
            },{
                label:'Asistencia',
                icon:'pi pi-fw pi-users',
                routerLink: ['/asistencia/admin']
            }]
        }
        //     {
        //     label: 'Generales', items: [{
        //         label: 'Observaciones',
        //         icon: 'pi pi-fw pi-id-card',
        //         items: [{
        //             label: 'Asignaciones', icon: 'pi pi-fw pi-list', routerLink: ['/colabora/observaciones']
        //         }, {
        //             label: 'Nueva Observación', icon: 'pi pi-fw pi-plus', routerLink: ['/colabora/observaciones/add']
        //         }, {label: 'Colaboración', icon: 'pi pi-objects-column', routerLink: ['/colabora']}],
        //         routerLink: ['/colabora/observaciones']
        //     }, {
        //         label: 'OpenBuilder', icon: 'isc isc-registry', routerLink: ['reporte/ticket/add']
        //     },
        //
        //     ]
        // }, {
        //     label: 'Auditoría', items: [{label: 'Observaciones', icon: 'isc isc-report'}]
        // }, {
        //     label: 'Mantenimiento', items: [{
        //         label: 'Panel', icon: 'pi pi-fw pi-cog', routerLink: ['/mantenimiento/panel']
        //     }]
        // }, {
        //     label: 'Sistemas', items: [{
        //         label: 'Credenciales', icon: 'pi pi-fw pi-desktop', routerLink: ['/sistemas/cuenta-prov']
        //     }]
        // }
            // {
            //     label: 'Integra',
            //     items: [
            //         {
            //             label: 'Auditorías',
            //             icon: 'pi pi-fw pi-clipboard',
            //             items: [
            //                 {
            //                     label: 'Panel de Reportes',
            //                     icon: 'pi pi-fw pi-list',
            //                 },
            //                 {
            //                     label: 'Nueva Auditoría',
            //                     icon: 'pi pi-fw pi-plus',
            //                     routerLink: ['/auditoria/crear']
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Sistemas IT',
            //
            //             icon: 'pi pi-fw pi-desktop'
            //         },
            //
            //         {
            //             label: 'Configuración',
            //             icon: 'pi pi-fw pi-cog'
            //         }
            //     ]
            // }
        ];
    }
}
