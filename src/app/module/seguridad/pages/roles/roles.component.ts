import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TitleComponent } from '@/shared/component/title/title.component';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { Rol, Modulo, Permiso } from '@/models/seguridad/rol';
import { RolService } from '@/core/services/seguridad/rol.service';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rol',
  standalone: true,
  imports: [CommonModule, Card, Button, Checkbox, Dialog, FormsModule, TitleComponent, SpinnerComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  roles = signal<Rol[]>([]);
  modulos = signal<Modulo[]>([]);
  loading = signal(false);

  selectedRol: Rol | null = null;
  showPermissionsDialog = false;
  selectedPermissions: number[] = [];

  constructor(
    private rolService: RolService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    forkJoin({
      roles: this.rolService.obtenerRoles(),
      modulos: this.rolService.obtenerModulos()
    }).subscribe({
      next: (response) => {
        this.roles.set(response.roles.data || []);
        this.modulos.set(response.modulos.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  editarPermisos(rol: Rol): void {
    this.selectedRol = rol;
    this.selectedPermissions = rol.permisos.map(p => p.id);
    this.showPermissionsDialog = true;
  }

  cerrarDialog(): void {
    this.showPermissionsDialog = false;
    this.selectedRol = null;
    this.selectedPermissions = [];
  }

  guardarPermisos(): void {
    if (!this.selectedRol) return;

    this.rolService.actualizarPermisos(this.selectedRol.id, this.selectedPermissions)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Permisos actualizados correctamente'
          });
          this.cargarDatos();
          this.cerrarDialog();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar permisos'
          });
        }
      });
  }

  onPermissionChange(permisoId: number, checked: boolean): void {
    if (checked) {
      this.selectedPermissions.push(permisoId);
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(id => id !== permisoId);
    }
  }

  isPermissionSelected(permisoId: number): boolean {
    return this.selectedPermissions.includes(permisoId);
  }

  getAllPermissions(): Permiso[] {
    const permisos: Permiso[] = [];
    this.modulos().forEach(modulo => {
      modulo.submodulos.forEach(submodulo => {
        permisos.push(...submodulo.permisos);
      });
    });
    return permisos;
  }
}
