import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '@/shared/component/title/title.component';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { RolService, Rol } from './service/rol.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-rol-admin',
    imports: [CommonModule, TitleComponent, TableModule, IconField, InputIcon, InputText],
    templateUrl: './rol-admin.html',
    styleUrl: './rol-admin.scss'
})
export class RolAdmin implements OnInit {
    roles = signal<Rol[]>([]);
    loading = signal(false);
    
    private rolService = inject(RolService);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.cargarRoles();
    }

    cargarRoles() {
        this.loading.set(true);
        this.rolService.obtenerRoles().subscribe({
            next: (response) => {
                this.roles.set(response.data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error al cargar roles:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los roles'
                });
                this.loading.set(false);
            }
        });
    }
}
