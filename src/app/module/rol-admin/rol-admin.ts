import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TitleComponent } from '@/shared/component/title/title.component';
import { RolService } from '@/module/rol-admin/service/rol.service';

export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string;
}

interface Permiso {
    id: number;
    nombre: string;
    asignado: boolean;
}

interface Submodulo {
    id: number;
    nombre: string;
    permisos: Permiso[];
}

interface Modulo {
    id: number;
    nombre: string;
    submodulos: Submodulo[];
}

@Component({
    selector: 'app-rol-admin',
    standalone: true,
    imports: [CommonModule, TitleComponent, Tabs, TabList, Tab, TabPanels, TabPanel, ToastModule, TableModule],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './rol-admin.html',
    styleUrls: ['./rol-admin.scss']
})
export class RolAdmin implements OnInit {
    roles = signal<Rol[]>([]);
    loading = signal(false);
    selectedRol = signal<Rol | null>(null);
    modulos = signal<Modulo[]>([]);

    Math = Math;
    modulosBase: Modulo[] = [
        {
            id: 28,
            nombre: 'Generales',
            submodulos: [
                {
                    id: 29,
                    nombre: 'Generales',
                    permisos: [
                        {
                            id: 28,
                            nombre: 'Consultar generales de unidad',
                            asignado: false
                        }
                    ]
                }
            ]
        },
        {
            id: 1,
            nombre: 'Gestión RRHH',
            submodulos: [
                {
                    id: 2,
                    nombre: 'Empleados',
                    permisos: [
                        { id: 1, nombre: 'Consultar empleados', asignado: false },
                        { id: 2, nombre: 'Crear empleados', asignado: false },
                        { id: 3, nombre: 'Editar empleados', asignado: false },
                        { id: 4, nombre: 'Exportar empleados', asignado: false },
                        { id: 5, nombre: 'Visualizar indicadores', asignado: false }
                    ]
                },
                {
                    id: 8,
                    nombre: 'Asistencia',
                    permisos: [
                        { id: 6, nombre: 'Consultar asistencia', asignado: false },
                        { id: 7, nombre: 'Restringir consulta a supervisor', asignado: false },
                        { id: 8, nombre: 'Exportar asistencia', asignado: false },
                        { id: 9, nombre: 'Agregar registro', asignado: false },
                        { id: 10, nombre: 'Editar registro', asignado: false }
                    ]
                },
                {
                    id: 14,
                    nombre: 'Configuración OpenTime',
                    permisos: [
                        { id: 11, nombre: 'Consultar indicadores', asignado: false },
                        { id: 12, nombre: 'Editar tiempo de compensación', asignado: false },
                        { id: 13, nombre: 'Autorizar configuraciones', asignado: false },
                        { id: 14, nombre: 'Editar uso de camara', asignado: false }
                    ]
                },
                {
                    id: 19,
                    nombre: 'Compensaciones asignadas',
                    permisos: [
                        { id: 15, nombre: 'Consultar compensaciones', asignado: false },
                        { id: 16, nombre: 'Exportar compensaciones', asignado: false }
                    ]
                }
            ]
        },
        {
            id: 23,
            nombre: 'Infraestructura TI',
            submodulos: [
                {
                    id: 24,
                    nombre: 'Servidor',
                    permisos: [
                        { id: 17, nombre: 'Monitoreo de caché', asignado: false }
                    ]
                },
                {
                    id: 26,
                    nombre: 'Redes',
                    permisos: [
                        { id: 18, nombre: 'Gestionar redes', asignado: false }
                    ]
                },
                {
                    id: 27,
                    nombre: 'Soporte Técnico',
                    permisos: [
                        { id: 19, nombre: 'Crear tickets', asignado: false },
                        { id: 20, nombre: 'Resolver tickets', asignado: false },
                        { id: 21, nombre: 'Ver historial', asignado: false }
                    ]
                }
            ]
        },
        {
            id: 32,
            nombre: 'Administración',
            submodulos: [
                {
                    id: 33,
                    nombre: 'Usuarios',
                    permisos: [
                        { id: 22, nombre: 'Crear usuarios', asignado: false },
                        { id: 23, nombre: 'Editar usuarios', asignado: false },
                        { id: 24, nombre: 'Desactivar usuarios', asignado: false },
                        { id: 25, nombre: 'Resetear contraseñas', asignado: false }
                    ]
                },
                {
                    id: 38,
                    nombre: 'Roles y Permisos',
                    permisos: [
                        { id: 26, nombre: 'Gestionar roles', asignado: false },
                        { id: 27, nombre: 'Asignar permisos', asignado: false }
                    ]
                }
            ]
        }
    ];

    private rolService = inject(RolService);
    private messageService = inject(MessageService);

    ngOnInit() {
        this.cargarRoles();
    }

    selectRol(rol: Rol) {
        if (this.selectedRol()?.id === rol.id) {
            this.selectedRol.set(null);
            this.modulos.set([]);
        } else {
            this.selectedRol.set(rol);
            this.cargarPermisosPorRol(rol.id);
        }
    }

    cargarPermisosPorRol(id: number) {
        this.loading.set(true);

        this.rolService.obtenerPermisosPorRol(id).subscribe({
            next: (response) => {
                // Extraer solo los IDs de los permisos retornados por el API
                const permisosAsignados = response.data.map((permiso) => permiso.id);

                // Clonar la estructura base de módulos
                const modulosConEstado: Modulo[] = JSON.parse(JSON.stringify(this.modulosBase));

                // Marcar como asignados los permisos que están en el array
                modulosConEstado.forEach((modulo) => {
                    modulo.submodulos.forEach((submodulo) => {
                        submodulo.permisos.forEach((permiso) => {
                            permiso.asignado = permisosAsignados.includes(permiso.id);
                        });
                    });
                });

                this.modulos.set(modulosConEstado);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error al cargar permisos del rol:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al Cargar Permisos',
                    detail: 'No se pudieron obtener los permisos del rol seleccionado',
                    life: 4000
                });
                this.loading.set(false);

                // En caso de error, mostrar estructura vacía
                this.modulos.set(JSON.parse(JSON.stringify(this.modulosBase)));
            }
        });
    }

    togglePermiso(permiso: Permiso, submodulo: Submodulo, modulo: Modulo) {
        const nuevoEstado = !permiso.asignado;

        this.modulos.update((currentModules) => {
            return currentModules.map((m) => {
                if (m.id !== modulo.id) return m;

                return {
                    ...m,
                    submodulos: m.submodulos.map((sm) => {
                        if (sm.id !== submodulo.id) return sm;

                        return {
                            ...sm,
                            permisos: sm.permisos.map((p) => {
                                if (p.id !== permiso.id) return p;
                                return { ...p, asignado: nuevoEstado };
                            })
                        };
                    })
                };
            });
        });

        const accion = nuevoEstado ? 'habilitado' : 'deshabilitado';

        this.messageService.add({
            severity: nuevoEstado ? 'success' : 'info',
            summary: 'Permiso Actualizado',
            detail: `"${permiso.nombre}" ${accion} en ${modulo.nombre} → ${submodulo.nombre}`,
            life: 3000
        });
    }

    // Método para seleccionar/deseleccionar todos los permisos de un submódulo
    toggleTodosPermisos(submodulo: Submodulo, modulo: Modulo) {
        const todosSeleccionados = this.todosPermisosSeleccionados(submodulo);
        const nuevoEstado = !todosSeleccionados;

        this.modulos.update((currentModules) => {
            return currentModules.map((m) => {
                if (m.id !== modulo.id) return m;

                return {
                    ...m,
                    submodulos: m.submodulos.map((sm) => {
                        if (sm.id !== submodulo.id) return sm;

                        return {
                            ...sm,
                            permisos: sm.permisos.map((p) => ({
                                ...p,
                                asignado: nuevoEstado
                            }))
                        };
                    })
                };
            });
        });

        const accion = nuevoEstado ? 'habilitados' : 'deshabilitados';
        const cantidad = submodulo.permisos.length;

        this.messageService.add({
            severity: nuevoEstado ? 'success' : 'info',
            summary: 'Permisos Actualizados',
            detail: `${cantidad} permisos ${accion} en ${submodulo.nombre}`,
            life: 3000
        });
    }

    // Verifica si todos los permisos del submódulo están seleccionados
    todosPermisosSeleccionados(submodulo: Submodulo): boolean {
        return submodulo.permisos.length > 0 && submodulo.permisos.every((p) => p.asignado);
    }

    // Verifica si algunos (pero no todos) los permisos están seleccionados
    algunosPermisosSeleccionados(submodulo: Submodulo): boolean {
        const seleccionados = submodulo.permisos.filter((p) => p.asignado).length;
        return seleccionados > 0 && seleccionados < submodulo.permisos.length;
    }

    // ========== MÉTODOS DE CONTEO ==========

    contarPermisosActivos(): number {
        return this.modulos().reduce((total, modulo) => {
            return (
                total +
                modulo.submodulos.reduce((subTotal, submodulo) => {
                    return subTotal + submodulo.permisos.filter((p) => p.asignado).length;
                }, 0)
            );
        }, 0);
    }

    contarPermisosActivosModulo(modulo: Modulo): number {
        const estadoModulo = this.modulos().find((m) => m.id === modulo.id);
        if (!estadoModulo) return 0;

        return estadoModulo.submodulos.reduce((total, submodulo) => {
            return total + submodulo.permisos.filter((p) => p.asignado).length;
        }, 0);
    }

    contarTotalPermisosModulo(modulo: Modulo): number {
        return modulo.submodulos.reduce((total, submodulo) => {
            return total + submodulo.permisos.length;
        }, 0);
    }

    // CORREGIDO: Ahora cuenta directamente desde el submódulo recibido
    contarPermisosActivosSubmodulo(submodulo: Submodulo): number {
        return submodulo.permisos.filter((p) => p.asignado).length;
    }

    getPorcentajeModulo(modulo: Modulo): number {
        const total = this.contarTotalPermisosModulo(modulo);
        const activos = this.contarPermisosActivosModulo(modulo);
        return total > 0 ? Math.round((activos / total) * 100) : 0;
    }

    getPorcentajeSubmodulo(submodulo: Submodulo): number {
        const total = submodulo.permisos.length;
        const activos = this.contarPermisosActivosSubmodulo(submodulo);
        return total > 0 ? Math.round((activos / total) * 100) : 0;
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
                    summary: 'Error al Cargar',
                    detail: 'No se pudieron obtener los roles del sistema',
                    life: 4000
                });
                this.loading.set(false);
            }
        });
    }
}
