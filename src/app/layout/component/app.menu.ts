import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            // --- GRUPO 1: Inicio (Renombrado de 'Home' a 'Panel Principal') ---
            {
                label: 'Panel Principal', // Nombre del grupo cambiado
                items: [{ label: 'Vista General', icon: 'pi pi-fw pi-home', routerLink: ['/'] }] // Nombre de la opción cambiado
            },
            // --- GRUPO 2: Configuración (Renombrado de 'Generales' a 'Configuración') ---
            {
                label: 'Generales', // Nombre del grupo cambiado
                items: [
                    {
                        label: 'Administración de unidades', // Nombre de la opción cambiado
                        routerLink: ['/sucursal']
                    }
                ]
            },
            // --- GRUPO 3: Capital Humano (Renombrado de 'GESTIÓN DE RRHH' a 'Capital Humano') ---
            {
                label: 'CAPITAL HUMANO', // Nombre del grupo cambiado
                items: [
                    {
                        label: 'Talento y Personal', // Nombre de la subopción cambiado
                        items: [
                            {
                                label: 'Empleados', // Nombre de la opción de nivel más bajo cambiado
                                icon: 'pi pi-fw pi-users',
                                routerLink: ['/empleado/admin']
                            }
                        ]
                    },
                    {
                        label: 'Control de Horarios', // Nombre de la subopción cambiado
                        items: [
                            { label: 'Informe de asistencia', icon: 'pi pi-fw pi-list', routerLink: ['/asistencia/admin'] }, // Nombre cambiado
                            { label: 'Config. OpenTime', icon: 'pi pi-fw pi-camera', routerLink: ['/asistencia/kioscos'] }, // Nombre cambiado
                            { label: 'Compensaciones', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/asistencia/compensacion'] },
                            { label: 'Reloj Checador', icon: 'pi pi-fw pi-clock', routerLink: ['/checador'] } // Nombre cambiado
                        ]
                    }
                ]
            },
            // --- GRUPO 4: Infraestructura TI (Renombrado de 'Sistemas TI' a 'Infraestructura TI') ---
            {
                label: 'INFRAESTRUCTURA TI', // Nombre del grupo cambiado
                items: [
                    { label: 'Gestión de Credenciales', routerLink: ['/credenciales/admin'] },
                    { label: 'Roles de operación', routerLink: ['/roles/admin'] }
                ]
            }
        ];
    }
}
