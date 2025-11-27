import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { Button } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { ContactoComponent } from '@/components/widgets/unidad/contacto/contacto.component';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { Unidad } from '@/models/empresa/unidad';
import { OperatividadComponent } from '@/components/widgets/unidad/operatividad/operatividad.component';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ZonaService } from '@/core/services/ubicacion/zona.service';
import { Estado } from '@/models/ubicacion/estado';
import { Select } from 'primeng/select';
import { EstadoService } from '@/core/services/ubicacion/estado.service';
import { Zona } from '@/models/ubicacion/zona';
import { normalizeProperties } from '@/shared/util/object.util';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { Textarea } from 'primeng/textarea';
import { Zonas } from '@/module/zonas/zonas';
import { TitleComponent } from '@/shared/component/title/title.component';
import { Autoridades } from '@/config/Autoridades';
import { HasPermissionDirective } from '@/core/security/HasPermissionDirective';
import { SpinnerService } from '@/shared/service/spinner.service';
import { UnidadExcelGenerator } from './unidad-excel-generator';
import { Panel } from 'primeng/panel';
import { AgregarUnidad } from './agregar-unidad/agregar-unidad';

@Component({
    selector: 'app-sucursal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ToastModule,
        ConfirmDialogModule,
        DialogModule,
        Button,
        TableModule,
        ContactoComponent,
        SpinnerComponent,
        OperatividadComponent,
        IconField,
        InputIcon,
        InputText,
        Select,
        Textarea,
        Zonas,
        TitleComponent,
        HasPermissionDirective,
        Panel,
        AgregarUnidad
    ],
    templateUrl: './unidades.html'
})
export class Unidades implements OnInit {
    @ViewChild('dt') dt!: Table;

    // Signals
    readonly unidades = signal<Unidad[]>([]);
    readonly zonas = signal<Zona[]>([]);
    readonly estados = signal<Estado[]>([]);
    readonly saving = signal(false);
    readonly exporting = signal(false);
    readonly isEditMode = signal(false);
    readonly filtroSupervisor = signal<string | null>(null);
    readonly filtroZona = signal<string | null>(null);
    readonly filtroEstatus = signal<boolean | null>(null);

    // UI State
    displayDialog = false;
    displayZonasDialog = false;
    openGeneralDialog = false;
    mostrarAgregarUnidad = false;
    unidadSeleccionada = 0;
    searchValue = '';

    // Constants
    readonly estatusOptions = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ];
    protected readonly Autoridades = Autoridades;

    // Computed signals (memoizados automáticamente)
    readonly stats = computed(() => {
        const unidades = this.unidades();
        const activas = unidades.filter((u) => u.activo).length;
        return {
            activas,
            inactivas: unidades.length - activas,
            total: unidades.length
        };
    });

    readonly supervisores = computed(() => {
        const seen = new Set<string>();
        return this.unidades()
            .filter((u) => {
                const nombre = u.supervisor?.nombreCompleto;
                if (!nombre || seen.has(nombre)) return false;
                seen.add(nombre);
                return true;
            })
            .map((u) => ({ nombreCompleto: u.supervisor!.nombreCompleto }));
    });

    readonly unidadesFiltradas = computed(() => {
        const supervisor = this.filtroSupervisor();
        const zona = this.filtroZona();
        const estatus = this.filtroEstatus();

        // Early return si no hay filtros
        if (!supervisor && !zona && estatus === null) {
            return this.unidades();
        }

        return this.unidades().filter((unidad) => {
            if (supervisor && unidad.supervisor?.nombreCompleto !== supervisor) return false;
            if (zona && unidad.contacto?.zona?.nombre !== zona) return false;
            if (estatus !== null && unidad.activo !== estatus) return false;
            return true;
        });
    });

    // Services (inyección mediante inject)
    private readonly zonaService = inject(ZonaService);
    private readonly estadoService = inject(EstadoService);
    private readonly unidadService = inject(UnidadService);
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly spinnerService = inject(SpinnerService);
    private readonly destroyRef = inject(DestroyRef);

    // Form (readonly para evitar reasignaciones)
    readonly form = this.fb.nonNullable.group({
        id: [null as number | null],
        clave: ['', [Validators.required, Validators.maxLength(10)]],
        nombre: ['', [Validators.required, Validators.maxLength(100)]],
        telefono: ['', Validators.maxLength(15)],
        activo: [true],
        direccion: ['', Validators.maxLength(255)],
        email: ['', Validators.maxLength(100)],
        idZona: [null as number | null, Validators.required],
        idEstado: [null as number | null, Validators.required]
    });

    ngOnInit(): void {
        this.spinnerService.show();
        this.loadData();
    }

    ultimaSincronizacion(): Date {
        return this.unidadService.obtenerUltimaFechaSincronizacion();
    }

    openCreateDialog(): void {
        this.mostrarAgregarUnidad = true;
    }

    onUnidadCreada(): void {
        this.unidadService.removeCache();
        this.loadData();
    }

    openEditDialog(unidad: Unidad): void {
        this.isEditMode.set(true);
        this.unidadService
            .obtenerContacto(unidad.id!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: ({ data }) => {
                    this.form.patchValue({
                        id: data.id,
                        clave: data.clave,
                        nombre: data.nombre,
                        telefono: data.contacto.telefono,
                        activo: data.activo,
                        direccion: data.contacto.direccion,
                        email: data.contacto.email,
                        idZona: data.contacto.zona.id,
                        idEstado: data.contacto.estado.id
                    });
                    this.displayDialog = true;
                },
                error: () => this.showError('Error al cargar los datos de la unidad')
            });
    }

    saveUnidad(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.showError('Complete los campos requeridos');
            return;
        }

        this.saving.set(true);
        const unidadData = normalizeProperties(this.form.getRawValue());
        const operation = this.isEditMode() ? this.unidadService.actualizarUnidad(unidadData) : this.unidadService.registrarUnidad(unidadData);

        operation
            .pipe(
                tap(() => this.unidadService.removeCache()),
                finalize(() => this.saving.set(false)),
                takeUntilDestroyed(this.destroyRef),
                catchError((err) => {
                    this.showError('Error al guardar la unidad');
                    return of(null);
                })
            )
            .subscribe((data) => {
                if (data) {
                    this.showSuccess(data.message);
                    this.displayDialog = false;
                    this.loadData();
                }
            });
    }

    toggleStatus(unidad: Unidad): void {
        const newStatus = !unidad.activo;
        this.confirmAction(`¿Desea ${newStatus ? 'activar' : 'desactivar'} la unidad "${unidad.nombre}"?`, () => this.executeToggleStatus(unidad.id!, newStatus));
    }

    deleteUnidad(unidad: Unidad): void {
        this.confirmAction(`¿Está seguro de eliminar la unidad "${unidad.nombre}"? Esta acción no se puede deshacer.`, () => this.executeDelete(unidad.id!), true);
    }

    exportarExcel(): void {
        this.exporting.set(true);
        try {
            const datos = this.dt.filteredValue || this.unidadesFiltradas();
            UnidadExcelGenerator.generarExcel(datos);
        } finally {
            // Pequeño delay para feedback visual
            setTimeout(() => this.exporting.set(false), 500);
        }
    }

    abrirInfoGeneral(id: number): void {
        this.unidadSeleccionada = id;
        this.openGeneralDialog = true;
    }

    abrirDilogZonas(): void {
        this.displayZonasDialog = true;
    }

    sincronizar(): void {
        this.unidadService.removeCache();
        this.loadData();
    }

    onSupervisorChange(value: string | null): void {
        this.filtroSupervisor.set(value);
    }

    onZonaChange(value: string | null): void {
        this.filtroZona.set(value);
    }

    onEstatusChange(value: boolean | null): void {
        this.filtroEstatus.set(value);
    }

    // Private methods
    private loadData(): void {
        forkJoin({
            unidades: this.unidadService.obtenerUnidades(),
            estados: this.estadoService.obtenerEstados(),
            zonas: this.zonaService.obtenerZonas()
        })
            .pipe(
                finalize(() => this.spinnerService.hide()),
                takeUntilDestroyed(this.destroyRef),
                catchError((err) => {
                    this.showError('Error al cargar los datos');
                    return of({ unidades: { data: [] }, estados: { data: [] }, zonas: { data: [] } });
                })
            )
            .subscribe(({ unidades, estados, zonas }) => {
                this.unidades.set(unidades.data);
                this.estados.set(estados.data);
                this.zonas.set(zonas.data);
            });
    }

    private executeToggleStatus(id: number, newStatus: boolean): void {
        this.unidadService
            .deshabilitarUnidad(id, newStatus)
            .pipe(
                tap(() => this.unidadService.removeCache()),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.showSuccess('Unidad actualizada');
                this.loadData();
            });
    }

    private executeDelete(id: number): void {
        this.unidadService
            .eliminarUnidad(id)
            .pipe(
                tap(() => this.unidadService.removeCache()),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.showSuccess('Unidad eliminada');
                this.loadData();
            });
    }

    private confirmAction(message: string, accept: () => void, danger = false): void {
        this.confirmationService.confirm({
            message,
            header: 'Confirmar acción',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Si, continuar',
                severity: danger ? 'danger' : 'primary'
            },
            accept
        });
    }

    private showSuccess(detail: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Proceso completado',
            detail
        });
    }

    private showError(detail: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'No se puede continuar',
            detail
        });
    }
}
