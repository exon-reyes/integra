import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { AuthService } from '@/core/services/auth/AuthService';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
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
import { forkJoin } from 'rxjs';
import { Textarea } from 'primeng/textarea';
import { Zonas } from '@/module/zonas/zonas';
import { TitleComponent } from '@/shared/component/title/title.component';

@Component({
    selector: 'app-sucursal',
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
        TitleComponent
    ],
    templateUrl: './unidades.html',
    providers: [MessageService, ConfirmationService]
})
export class Unidades implements OnInit {
    unidadSeleccionada = 0;
    unidades = signal<Unidad[]>([]);
    loading = signal(true);
    saving = signal(false);
    exporting = signal(false);
    displayDialog = false;
    isEditMode = signal(false);
    openGeneralDialog = false;
    displayZonasDialog = false;
    zonas = signal<Zona[]>([]);
    estados = signal<Estado[]>([]);
    searchValue = '';
    stats = computed(() => {
        const unidades = this.unidades();
        const activas = unidades.filter((u) => u.activo).length;
        return { activas, inactivas: unidades.length - activas, total: unidades.length };
    });
    private zonaService = inject(ZonaService);
    private estadoService = inject(EstadoService);
    private unidadService = inject(UnidadService);
    private fb = inject(FormBuilder);
    form = this.fb.group({
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
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private authService = inject(AuthService);

    ngOnInit() {
        this.loadData();
    }

    openCreateDialog() {
        this.isEditMode.set(false);
        this.form.reset({ activo: true });
        this.displayDialog = true;
    }

    openEditDialog(unidad: Unidad) {
        this.isEditMode.set(true);
        this.unidadService.obtenerContacto(unidad.id).subscribe({
            next: (value) => {
                this.form.patchValue({
                    id: value.data.id,
                    clave: value.data.clave,
                    nombre: value.data.nombre,
                    telefono: value.data.contacto.telefono,
                    activo: value.data.activo,
                    direccion: value.data.contacto.direccion,
                    email: value.data.contacto.email,
                    idZona: value.data.contacto.zona.id,
                    idEstado: value.data.contacto.estado.id
                });
                this.displayDialog = true;
            }
        });
    }

    saveUnidad() {
        if (this.form.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Complete todos los campos requeridos'
            });
            return;
        }

        this.saving.set(true);
        const unidadData = normalizeProperties(this.form.value);
        const operation = this.isEditMode() ? this.unidadService.actualizarUnidad(unidadData) : this.unidadService.registrarUnidad(unidadData);

        operation.subscribe({
            next: () => {
                this.unidadService.removeCache();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Unidad ${this.isEditMode() ? 'actualizada' : 'registrada'} correctamente`
                });
                this.displayDialog = false;
                this.loadData();
                this.saving.set(false);
            },
            error: () => this.saving.set(false)
        });
    }

    toggleStatus(unidad: Unidad) {
        const newStatus = !unidad.activo;
        this.confirmationService.confirm({
            message: `¿Está seguro de ${newStatus ? 'habilitar' : 'deshabilitar'} la unidad ${unidad.nombre}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.unidadService.deshabilitarUnidad(unidad.id, newStatus).subscribe({
                    next: () => {
                        this.unidadService.removeCache();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Unidad ${newStatus ? 'habilitada' : 'deshabilitada'} correctamente`
                        });
                        this.loadData();
                    }
                });
            }
        });
    }

    hasPermission = (permission: string) => this.authService.hasAuthority(permission);

    abrirInfoGeneral(id: number) {
        this.openGeneralDialog = true;
        this.unidadSeleccionada = id;
    }

    abrirDilogZonas() {
        this.displayZonasDialog = true;
    }

    sincronizar() {
        this.unidadService.removeCache();
        this.loadData();
    }

    deleteUnidad(unidad: Unidad) {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar la unidad ${unidad.nombre}? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.unidadService.eliminarUnidad(unidad.id).subscribe({
                    next: () => {
                        this.unidadService.removeCache();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Unidad eliminada correctamente'
                        });
                        this.loadData();
                    }
                });
            }
        });
    }

    exportarExcel() {
        this.exporting.set(true);
        this.unidadService.exportarUnidades().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'unidades.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
                this.exporting.set(false);
            },
            error: () => this.exporting.set(false)
        });
    }

    private loadData() {
        this.loading.set(true);
        forkJoin({
            unidades: this.unidadService.obtenerUnidades(),
            estados: this.estadoService.obtenerEstados(),
            zonas: this.zonaService.obtenerZonas()
        }).subscribe({
            next: ({ unidades, estados, zonas }) => {
                this.unidades.set(unidades.data);
                this.estados.set(estados.data);
                this.zonas.set(zonas.data);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }
}
