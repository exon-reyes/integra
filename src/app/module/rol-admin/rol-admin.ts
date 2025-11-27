import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TitleComponent } from '@/shared/component/title/title.component';
import { Rol, RolService } from '@/module/rol-admin/service/rol.service';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { NuevoRol } from '@/module/rol-admin/nuevo-rol/nuevo-rol';
import { Modulo, modulosBase, Permiso, Submodulo } from '@/module/modulos';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { SpinnerComponent } from '@/shared/component/spinner.component';

@Component({
    selector: 'app-rol-admin',
    standalone: true,
    imports: [CommonModule, TitleComponent, ToastModule, ConfirmDialogModule, TableModule, FormsModule, Button, Dialog, NuevoRol, Accordion, AccordionPanel, AccordionHeader, AccordionContent, SpinnerComponent],
    providers: [MessageService, ConfirmationService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './rol-admin.html',
    styleUrls: ['./rol-admin.scss']
})
export class RolAdmin implements OnInit {
    roles = signal<Rol[]>([]);
    loadingRoles = signal(true);
    loadingPermisos = signal(false);
    selectedRol = signal<Rol | null>(null);
    modulos = signal<Modulo[]>([]);
    modoEdicion = signal(false);
    modoEdicionNombre = signal(false);
    mostrarDialogoNuevoRol = false;
    mostrarModalPermisos = false;
    private nombreOriginal = '';
    private descripcionOriginal = '';

    // Servicios
    private readonly rolService = inject(RolService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    ngOnInit() {
        this.cargarRoles();
    }

    // ==========================================
    // SELECCIÓN Y CARGA
    // ==========================================

    selectRol(rol: Rol) {
        this.mostrarModalPermisos = true;
        this.selectedRol.set(rol);
        this.modoEdicion.set(false);
        this.cargarPermisosPorRol(rol.id);
    }

    togglePermiso(permiso: Permiso, submodulo: Submodulo, modulo: Modulo) {
        if (!this.modoEdicion()) return;

        const nuevoEstado = !permiso.asignado;

        // Actualización atómica: Permiso -> Submódulo -> Módulo
        this.updateModulos(modulo.id, (m) => this.actualizarEstadoCascada(m, submodulo.id, permiso.id, nuevoEstado));
    }

    // ==========================================
    // LÓGICA DE PERMISOS OPTIMIZADA ⚡
    // ==========================================

    toggleTodosPermisos(submodulo: Submodulo, modulo: Modulo) {
        if (!this.modoEdicion()) return;

        const nuevoEstado = !this.todosPermisosSeleccionados(submodulo);

        this.updateModulos(modulo.id, (m) => {
            // 1. Actualizar Submódulo y sus permisos
            const submodulosActualizados = m.submodulos.map((sm) => {
                if (sm.id === submodulo.id) {
                    return {
                        ...sm,
                        asignado: nuevoEstado, // Si selecciono todos, el submódulo se asigna automáticamente
                        permisos: sm.permisos.map((p) => ({ ...p, asignado: nuevoEstado }))
                    };
                }
                return sm;
            });

            // 2. Recalcular Módulo basado en los nuevos submódulos
            const moduloAsignado = submodulosActualizados.some((sm) => sm.asignado);

            return {
                ...m,
                asignado: moduloAsignado,
                submodulos: submodulosActualizados
            };
        });
    }

    toggleTodosPermisosModulo(modulo: Modulo) {
        if (!this.modoEdicion()) return;

        const nuevoEstado = !this.todosPermisosModuloSeleccionados(modulo);

        this.updateModulos(modulo.id, (m) => ({
            ...m,
            asignado: nuevoEstado,
            submodulos: m.submodulos.map((sm) => ({
                ...sm,
                asignado: nuevoEstado,
                permisos: sm.permisos.map((p) => ({ ...p, asignado: nuevoEstado }))
            }))
        }));
    }

    guardarPermisos() {
        const rol = this.selectedRol();
        if (!rol) return;

        // Ahora obtenerPermisosAsignados es pura recolección, sin lógica de negocio
        const permisosAsignados = this.obtenerPermisosAsignados();

        this.rolService.actualizarPermisosRol(rol.id, permisosAsignados).subscribe({
            next: () => {
                this.modoEdicion.set(false);
                this.showSuccess('Permisos Guardados', `Los permisos del rol "${rol.nombre}" se han actualizado correctamente`);
            }
        });
    }

    // Helpers de vista (Template)
    todosPermisosSeleccionados(submodulo: Submodulo): boolean {
        return submodulo.permisos.length > 0 && submodulo.permisos.every((p) => p.asignado);
    }

    algunosPermisosSeleccionados(submodulo: Submodulo): boolean {
        // Usar los flags para evitar conteos si no es necesario
        if (!submodulo.asignado) return false;
        const count = submodulo.permisos.filter((p) => p.asignado).length;
        return count > 0 && count < submodulo.permisos.length;
    }

    // ==========================================
    // RECOLECCIÓN DE DATOS (GUARDADO)
    // ==========================================

    todosPermisosModuloSeleccionados(modulo: Modulo): boolean {
        return modulo.submodulos.every((sm) => this.todosPermisosSeleccionados(sm));
    }

    algunosPermisosModuloSeleccionados(modulo: Modulo): boolean {
        if (!modulo.asignado) return false;
        // Lógica simplificada visual
        const totalPermisos = modulo.submodulos.reduce((total, sm) => total + sm.permisos.length, 0);
        const activos = this.contarPermisosEnModulo(modulo);
        return activos > 0 && activos < totalPermisos;
    }

    // ==========================================
    // HELPERS Y UTILIDADES
    // ==========================================

    contarPermisosActivos(): number {
        return this.modulos().reduce((acc, m) => acc + this.contarPermisosEnModulo(m), 0);
    }

    // Método faltante agregado
    contarPermisosActivosSubmodulo(submodulo: Submodulo): number {
        return submodulo.permisos.filter((p) => p.asignado).length;
    }

    cargarRoles() {
        this.loadingRoles.set(true);
        this.rolService.obtenerRoles().subscribe({
            next: (res) => {
                this.roles.set(res.data);
                this.loadingRoles.set(false);
            },
            error: () => this.loadingRoles.set(false)
        });
    }

    editarRol(rol: Rol) {
        if (rol.rolDefault) {
            this.showWarning('Acción No Permitida', 'No se puede editar un rol protegido');
            return;
        }
        this.selectedRol.set(rol);
        this.cargarPermisosPorRol(rol.id);
        this.modoEdicion.set(true);
        this.showInfo('Modo Edición', `Editando: ${rol.nombre}`);
    }

    eliminarRol(rol: Rol) {
        if (rol.rolDefault) {
            this.showWarning('Acción No Permitida', 'No se puede eliminar un rol protegido');
            return;
        }
        this.confirmationService.confirm({
            message: '¿Eliminar rol y revocar permisos permanentemente?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.confirmarEliminacionRol(rol)
        });
    }

    editarNombreDescripcion() {
        const rol = this.selectedRol();
        if (!rol) return;
        this.nombreOriginal = rol.nombre;
        this.descripcionOriginal = rol.descripcion || '';
        this.modoEdicionNombre.set(true);
    }

    guardarNombreDescripcion() {
        const rol = this.selectedRol();
        if (!rol) return;
        this.rolService.actualizarNombreRol(rol.id, { nombre: rol.nombre, descripcion: rol.descripcion }).subscribe({
            next: () => {
                this.showSuccess('Guardado', 'Información actualizada');
                this.modoEdicionNombre.set(false);
            }
        });
    }

    cancelarEdicionNombre() {
        const rol = this.selectedRol();
        if (!rol) return;
        rol.nombre = this.nombreOriginal;
        rol.descripcion = this.descripcionOriginal;
        this.modoEdicionNombre.set(false);
    }

    cancelarEdicionPermisos() {
        const rol = this.selectedRol();
        if (!rol) return;
        this.modoEdicion.set(false);
        this.cargarPermisosPorRol(rol.id);
        this.showInfo('Cancelado', 'Cambios revertidos');
    }

    // ==========================================
    // GESTIÓN CRUD DE ROLES (Sin cambios mayores)
    // ==========================================

    // Nuevo Rol
    crearNuevoRol() {
        this.mostrarDialogoNuevoRol = true;
    }

    cancelarCreacionRol() {
        this.mostrarDialogoNuevoRol = false;
    }

    manejarRolAgregado(nuevoRol: Rol) {
        this.mostrarDialogoNuevoRol = false;
        this.roles.update((prev) => [...prev, nuevoRol]);
    }

    private cargarPermisosPorRol(id: number) {
        this.loadingPermisos.set(true);

        this.rolService.obtenerPermisosPorRol(id).subscribe({
            next: (response) => {
                // O(1) Lookup Set
                const permisosAsignados = new Set(response.data.map((p) => p.id));
                const modulosConEstado = this.mapearPermisosAModulos(permisosAsignados);
                this.modulos.set(modulosConEstado);
                this.loadingPermisos.set(false);
            },
            error: () => {
                this.modulos.set(this.clonarModulosBase());
                this.loadingPermisos.set(false);
            }
        });
    }

    /**
     * Núcleo de la optimización:
     * Actualiza el permiso específico y recalcula los flags del padre (Submódulo)
     * y del abuelo (Módulo) en el mismo ciclo de ejecución.
     */
    private actualizarEstadoCascada(modulo: Modulo, submoduloId: string, permisoId: string, nuevoEstado: boolean): Modulo {
        // 1. Actualizar Submódulos
        const submodulosActualizados = modulo.submodulos.map((sm) => {
            if (sm.id === submoduloId) {
                // a. Actualizar lista de permisos
                const permisosActualizados = sm.permisos.map((p) => (p.id === permisoId ? { ...p, asignado: nuevoEstado } : p));

                // b. Calcular estado del submódulo localmente (Optimization)
                const tienePermisosActivos = permisosActualizados.some((p) => p.asignado);

                return {
                    ...sm,
                    asignado: tienePermisosActivos,
                    permisos: permisosActualizados
                };
            }
            return sm;
        });

        // 2. Calcular estado del Módulo basado en los nuevos submódulos
        const moduloAsignado = submodulosActualizados.some((sm) => sm.asignado);

        return {
            ...modulo,
            asignado: moduloAsignado,
            submodulos: submodulosActualizados
        };
    }

    private updateModulos(moduloId: string, updateFn: (modulo: Modulo) => Modulo) {
        this.modulos.update((modulos) => modulos.map((m) => (m.id === moduloId ? updateFn(m) : m)));
    }

    private obtenerPermisosAsignados(): string[] {
        const permisos: string[] = [];

        // Confiamos en los flags 'asignado' que mantenemos sincronizados en tiempo real
        this.modulos().forEach((modulo) => {
            if (modulo.asignado && modulo.permisoAcceso) {
                permisos.push(modulo.permisoAcceso);
            }

            if (modulo.asignado) {
                // Solo iterar submódulos si el módulo está activo
                modulo.submodulos.forEach((submodulo) => {
                    if (submodulo.asignado) {
                        permisos.push(submodulo.id); // Guardar ID Submódulo

                        // Guardar Permisos individuales
                        submodulo.permisos.forEach((permiso) => {
                            if (permiso.asignado) {
                                permisos.push(permiso.id);
                            }
                        });
                    }
                });
            }
        });
        return permisos;
    }

    // Mapeo inicial desde backend
    private mapearPermisosAModulos(permisosAsignados: Set<string>): Modulo[] {
        return this.clonarModulosBase().map((modulo) => {
            // 1. Mapear submódulos primero para saber si están activos
            const submodulosMapeados = modulo.submodulos.map((submodulo) => {
                const permisosMapeados = submodulo.permisos.map((permiso) => ({
                    ...permiso,
                    asignado: permisosAsignados.has(permiso.id)
                }));

                // El submódulo está asignado si el backend lo dice O si tiene hijos asignados
                const asignado = permisosAsignados.has(submodulo.id) || permisosMapeados.some((p) => p.asignado);

                return {
                    ...submodulo,
                    asignado: asignado,
                    permisos: permisosMapeados
                };
            });

            // 2. Determinar estado del módulo
            const moduloAsignado = (modulo.permisoAcceso && permisosAsignados.has(modulo.permisoAcceso)) || submodulosMapeados.some((sm) => sm.asignado);

            return {
                ...modulo,
                asignado: !!moduloAsignado,
                submodulos: submodulosMapeados
            };
        });
    }

    private clonarModulosBase(): Modulo[] {
        return JSON.parse(JSON.stringify(modulosBase));
    }

    private contarPermisosEnModulo(modulo: Modulo): number {
        return modulo.submodulos.reduce((acc, sm) => acc + sm.permisos.filter((p) => p.asignado).length, 0);
    }

    private confirmarEliminacionRol(rol: Rol) {
        this.rolService.eliminarRol(rol.id).subscribe({
            next: () => {
                this.roles.update((r) => r.filter((x) => x.id !== rol.id));
                if (this.selectedRol()?.id === rol.id) this.resetSelection();
                this.showSuccess('Rol Eliminado', 'Operación exitosa');
            }
        });
    }

    private resetSelection() {
        this.selectedRol.set(null);
        this.modulos.set([]);
        this.modoEdicion.set(false);
    }

    // Mensajes
    private showSuccess(summary: string, detail: string) {
        this.messageService.add({ severity: 'success', summary, detail, life: 3000 });
    }
    private showInfo(summary: string, detail: string) {
        this.messageService.add({ severity: 'info', summary, detail, life: 3000 });
    }
    private showWarning(summary: string, detail: string) {
        this.messageService.add({ severity: 'warn', summary, detail, life: 4000 });
    }
}
