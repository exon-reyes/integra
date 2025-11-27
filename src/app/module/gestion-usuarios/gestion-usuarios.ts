import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '@/core/services/usuario/usuario.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Usuario } from '@/models/usuario/usuario';
import { Modulo, modulosBase, Permiso, Submodulo } from '@/module/modulos';
import { TitleComponent } from '@/shared/component/title/title.component';
import { NuevoUsuarioModalComponent } from './components/nuevo-usuario-modal/nuevo-usuario-modal.component';

@Component({
    selector: 'app-gestion-usuarios',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TagModule, DialogModule, RippleModule, FormsModule, TabsModule, TitleComponent, NuevoUsuarioModalComponent],
    templateUrl: './gestion-usuarios.html',
    styleUrls: ['./gestion-usuarios.scss']
})
export class GestionUsuarios implements OnInit {
    usuarios: Usuario[] = [];
    loading: boolean = true;
    selectedUsuario: any = null;
    globalFilter: string = '';

    // Propiedades para permisos especiales
    modoEdicionPermisos = false;
    modulosPermisos: Modulo[] = [];
    loadingPermisos: boolean = false;

    // Modal nuevo usuario
    mostrarModalNuevoUsuario: boolean = false;

    // Estructura base de módulos (igual que en roles)
    private modulosBase: Modulo[] = modulosBase;
    private usuarioService = inject(UsuarioService);
    constructor(
        private confirmService: ConfirmationService,
        private messageService: MessageService
    ) {}
    ngOnInit() {
        this.cargarUsuarios();
    }

    cargarUsuarios() {
        this.loading = true;
        this.usuarioService.obtenerUsuarios().subscribe({
            next: (response) => {
                this.usuarios = response.data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar usuarios:', error);
                this.loading = false;
            }
        });
    }

    actualizarEstructuraPermisos(permisosAsignados: string[]) {
        this.modulosPermisos = JSON.parse(JSON.stringify(this.modulosBase));

        // Obtener permisos de roles
        const permisosDeRoles: string[] = [];
        if (this.selectedUsuario?.roles) {
            this.selectedUsuario.roles.forEach((rol: any) => {
                if (rol.permisos) {
                    rol.permisos.forEach((permiso: any) => {
                        permisosDeRoles.push(permiso.nombre);
                    });
                }
            });
        }

        this.modulosPermisos.forEach((modulo: Modulo) => {
            modulo.submodulos.forEach((submodulo: Submodulo) => {
                submodulo.permisos.forEach((permiso: Permiso) => {
                    permiso.asignado = permisosAsignados.includes(permiso.id);
                    permiso.desdeRol = permisosDeRoles.includes(permiso.id);
                });
            });
        });
    }

    // ========== MÉTODOS DE USUARIOS ==========

    selectUsuario(usuario: Usuario) {
        if (this.selectedUsuario?.id === usuario.id) {
            this.selectedUsuario = null;
            this.modulosPermisos = [];
            this.modoEdicionPermisos = false;
        } else {
            this.selectedUsuario = usuario;
            this.modoEdicionPermisos = false;
            this.cargarPermisosEspecialesUsuario(usuario.id);
        }
    }

    cargarPermisosEspecialesUsuario(userId: number) {
        this.loadingPermisos = true;
        this.usuarioService.obtenerPrivilegios(userId).subscribe({
            next: (response) => {
                this.selectedUsuario = response.data;
                const permisosAsignados: string[] = response.data.permisos;
                this.actualizarEstructuraPermisos(permisosAsignados);
                this.loadingPermisos = false;
            },
            error: (error) => {
                console.error('Error al cargar privilegios:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los privilegios del usuario',
                    life: 4000
                });
                this.actualizarEstructuraPermisos([]);
                this.loadingPermisos = false;
            }
        });
    }

    // ========== MÉTODOS DE PERMISOS ESPECIALES ==========

    activarEdicionPermisos() {
        this.modoEdicionPermisos = true;
        this.messageService.add({
            severity: 'info',
            summary: 'Modo Edición Activado',
            detail: 'Ahora puedes modificar los permisos especiales del usuario',
            life: 3000
        });
    }

    // Métodos para manipulación de permisos
    togglePermisoUsuario(permiso: Permiso) {
        if (!this.modoEdicionPermisos || permiso.desdeRol) return;
        permiso.asignado = !permiso.asignado;
    }

    toggleTodosPermisosUsuario(submodulo: Submodulo) {
        if (!this.modoEdicionPermisos) return;
        const todosSeleccionados = this.todosPermisosSeleccionados(submodulo);
        const nuevoEstado = !todosSeleccionados;

        submodulo.permisos.forEach((permiso: Permiso) => {
            permiso.asignado = nuevoEstado;
        });
    }

    todosPermisosSeleccionados(submodulo: Submodulo): boolean {
        return submodulo.permisos.length > 0 && submodulo.permisos.every((p: Permiso) => p.asignado);
    }

    algunosPermisosSeleccionados(submodulo: Submodulo): boolean {
        const seleccionados = submodulo.permisos.filter((p: Permiso) => p.asignado).length;
        return seleccionados > 0 && seleccionados < submodulo.permisos.length;
    }

    contarPermisosActivosSubmodulo(submodulo: Submodulo): number {
        return submodulo.permisos.filter((p: Permiso) => p.asignado).length;
    }

    contarPermisosActivosModulo(modulo: Modulo): number {
        return modulo.submodulos.reduce((total: number, submodulo: Submodulo) => {
            return total + this.contarPermisosActivosSubmodulo(submodulo);
        }, 0);
    }

    contarTotalPermisosActivos(): number {
        return this.modulosPermisos.reduce((total: number, modulo: Modulo) => {
            return total + this.contarPermisosActivosModulo(modulo);
        }, 0);
    }

    guardarPermisosEspeciales() {
        if (!this.selectedUsuario) return;

        const permisosAsignados: string[] = [];
        this.modulosPermisos.forEach((modulo: Modulo) => {
            modulo.submodulos.forEach((submodulo: Submodulo) => {
                submodulo.permisos.forEach((permiso: Permiso) => {
                    if (permiso.asignado) {
                        permisosAsignados.push(permiso.id);
                    }
                });
            });
        });

        this.usuarioService.actualizarPermisosEspeciales(this.selectedUsuario.id, permisosAsignados).subscribe({
            next: () => {
                this.modoEdicionPermisos = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Permisos Guardados',
                    detail: 'Los permisos especiales se han actualizado correctamente',
                    life: 3000
                });
            },
            error: (error) => {
                console.error('Error al guardar permisos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron guardar los permisos especiales',
                    life: 4000
                });
            }
        });
    }

    cancelarEdicionPermisos() {
        this.modoEdicionPermisos = false;
        this.cargarPermisosEspecialesUsuario(this.selectedUsuario.id);
        this.messageService.add({
            severity: 'info',
            summary: 'Cambios Cancelados',
            detail: 'Se han descartado los cambios en los permisos especiales',
            life: 3000
        });
    }

    getRolesRestantes(usuario: any): string {
        if (!usuario.roles || usuario.roles.length <= 2) return '';
        const rolesRestantes = usuario.roles
            .slice(2)
            .map((r: any) => r.nombre)
            .join(', ');
        return `Roles adicionales: ${rolesRestantes}`;
    }

    agregarUsuario() {
        this.mostrarModalNuevoUsuario = true;
    }

    onUsuarioCreado() {
        this.cargarUsuarios();
    }

    onModalClosed() {
        this.mostrarModalNuevoUsuario = false;
    }

    esPermisoEditable(permiso: Permiso): boolean {
        return !permiso.desdeRol;
    }

    // ========== MÉTODOS ADICIONALES ==========

    editarUsuario(usuario: Usuario, event: Event) {
        event.stopPropagation();
        event.preventDefault();
        console.log('Editar:', usuario.nombre);
    }

    toggleEstado(usuario: Usuario, event: Event) {
        event.stopPropagation();
        event.preventDefault();

        const nuevoEstado = !usuario.activo;
        this.usuarioService.actualizarEstatus(usuario.id, nuevoEstado).subscribe({
            next: () => {
                // Actualizar en el array principal
                const index = this.usuarios.findIndex((u) => u.id === usuario.id);
                if (index !== -1) {
                    this.usuarios[index].activo = nuevoEstado;
                }
                // Actualizar usuario seleccionado si es el mismo
                if (this.selectedUsuario?.id === usuario.id) {
                    this.selectedUsuario.activo = nuevoEstado;
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estatus Actualizado',
                    detail: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('Error al actualizar estatus:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar el estatus del usuario',
                    life: 4000
                });
            }
        });
    }

    eliminarUsuario(usuario: Usuario, event: Event) {
        event.stopPropagation();
        event.preventDefault();

        this.confirmService.confirm({
            message: `Al continuar, el acceso del usuario "${usuario.nombre}" será revocado permanentemente. ¿Deseas proceder realmente?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.usuarioService.eliminarUsuario(usuario.id).subscribe({
                    next: () => {
                        // Actualizar la lista de usuarios eliminando el usuario
                        this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id);

                        // Si el usuario eliminado era el seleccionado, limpiar selección
                        if (this.selectedUsuario?.id === usuario.id) {
                            this.selectedUsuario = null;
                            this.modulosPermisos = [];
                            this.modoEdicionPermisos = false;
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuario Eliminado',
                            detail: `El usuario "${usuario.nombre}" ha sido eliminado correctamente`,
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    gestionarRoles(usuario: any) {
        console.log('Gestionar roles de:', usuario);
    }

    removerRol(usuario: any, rol: any) {
        this.confirmService.confirm({
            message: `¿Estás seguro de remover el rol "${rol.nombre}" del usuario "${usuario.username}"?`,
            header: 'Confirmar Remoción',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, remover',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Rol Removido',
                    detail: `El rol "${rol.nombre}" ha sido removido correctamente`,
                    life: 3000
                });
            }
        });
    }
}
