import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TitleComponent } from '@/shared/component/title/title.component';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { forkJoin } from 'rxjs';

import { Usuario } from '@/models/usuario/usuario';
import { Modulo, Submodulo, Permiso } from '@/models/seguridad/rol';
import { UsuarioService } from '@/core/services/usuario/usuario.service';
import { RolService } from '@/core/services/seguridad/rol.service';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, Card, Button, Dialog, TitleComponent, SpinnerComponent],
    templateUrl: './usuarios.component.html',
    styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
    usuarios = signal<Usuario[]>([]);
    modulos = signal<Modulo[]>([]);
    loading = signal(false);

    selectedUsuario: Usuario | null = null;
    showPermissionsDialog = false;
    userPermissions: Permiso[] = [];

    constructor(
        private usuarioService: UsuarioService,
        private rolService: RolService
    ) {}

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(): void {
        this.loading.set(true);
        forkJoin({
            usuarios: this.usuarioService.obtenerUsuarios(),
            modulos: this.rolService.obtenerModulos()
        }).subscribe({
            next: (response) => {
                this.usuarios.set(response.usuarios.data || []);
                this.modulos.set(response.modulos.data || []);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    verPermisos(usuario: Usuario): void {
        this.selectedUsuario = usuario;
        this.userPermissions = this.getUserPermissions(usuario);
        this.showPermissionsDialog = true;
    }

    cerrarDialog(): void {
        this.showPermissionsDialog = false;
        this.selectedUsuario = null;
        this.userPermissions = [];
    }

    private getUserPermissions(usuario: Usuario): Permiso[] {
        if (!usuario?.rol) return [];
        return usuario.rol.permisos
    }

    getPermissionsByModule(modulo: Modulo): Permiso[] {
        const modulePermissions: Permiso[] = [];
        modulo.submodulos.forEach(submodulo => {
            submodulo.permisos.forEach(permiso => {
                if (this.tienePermiso(permiso)) {
                    modulePermissions.push(permiso);
                }
            });
        });
        return modulePermissions;
    }
    selectedModulo: Modulo | null = null;

    seleccionarModulo(modulo: Modulo): void {
        this.selectedModulo = modulo;
    }
    // ✅ helpers para el template
    tienePermiso(permiso: Permiso): boolean {
        return this.userPermissions.some(up => up.id === permiso.id);
    }
}
