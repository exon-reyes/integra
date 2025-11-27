import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { ZonaService } from '@/core/services/ubicacion/zona.service';
import { EstadoService } from '@/core/services/ubicacion/estado.service';
import { MessageService } from 'primeng/api';
import { normalizeProperties } from '@/shared/util/object.util';
import { Zona } from '@/models/ubicacion/zona';
import { Estado } from '@/models/ubicacion/estado';
import { catchError, finalize, forkJoin, of } from 'rxjs';

@Component({
    selector: 'app-agregar-unidad',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Dialog, Button, InputText, Select, Textarea],
    template: `
        <p-dialog [visible]="visible" (onHide)="onCancel()" (visibleChange)="visibleChange.emit($event)" header="Agregar Nueva Unidad" [modal]="true" [closable]="true" [style]="{ width: '500px' }">
            <form [formGroup]="form" (ngSubmit)="onSave()">
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Clave *</label>
                        <input pInputText formControlName="clave" class="w-full" placeholder="Ingrese la clave" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Nombre *</label>
                        <input pInputText formControlName="nombre" class="w-full" placeholder="Ingrese el nombre" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Teléfono</label>
                        <input pInputText formControlName="telefono" class="w-full" placeholder="Ingrese el teléfono" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input pInputText formControlName="email" class="w-full" placeholder="Ingrese el email" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Zona *</label>
                        <p-select formControlName="idZona" [options]="zonas()" optionLabel="nombre" optionValue="id" appendTo="body" placeholder="Seleccione una zona" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Estado *</label>
                        <p-select formControlName="idEstado" [options]="estados()" optionLabel="nombre" optionValue="id" appendTo="body" placeholder="Seleccione un estado" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Dirección</label>
                        <textarea pTextarea formControlName="direccion" class="w-full" rows="3" placeholder="Ingrese la dirección"></textarea>
                    </div>
                </div>
            </form>

            <ng-template #footer>
                <div class="flex gap-2 justify-end">
                    <p-button label="Cancelar" [outlined]="true" (onClick)="onCancel()" />
                    <p-button label="Guardar" [loading]="saving()" (onClick)="onSave()" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class AgregarUnidad implements OnInit {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() unidadCreada = new EventEmitter<void>();

    readonly saving = signal(false);
    readonly zonas = signal<Zona[]>([]);
    readonly estados = signal<Estado[]>([]);

    private readonly fb = inject(FormBuilder);
    private readonly unidadService = inject(UnidadService);
    private readonly zonaService = inject(ZonaService);
    private readonly estadoService = inject(EstadoService);
    private readonly messageService = inject(MessageService);

    readonly form = this.fb.nonNullable.group({
        clave: ['', [Validators.required, Validators.maxLength(10)]],
        nombre: ['', [Validators.required, Validators.maxLength(100)]],
        telefono: ['', Validators.maxLength(15)],
        email: ['', Validators.maxLength(100)],
        direccion: ['', Validators.maxLength(255)],
        idZona: [null as number | null, Validators.required],
        idEstado: [null as number | null, Validators.required]
    });

    ngOnInit(): void {
        this.loadCatalogos();
    }

    private loadCatalogos(): void {
        forkJoin({
            zonas: this.zonaService.obtenerZonas(),
            estados: this.estadoService.obtenerEstados()
        })
            .pipe(
                catchError(() => {
                    this.showError('Error al cargar catálogos');
                    return of({ zonas: { data: [] }, estados: { data: [] } });
                })
            )
            .subscribe(({ zonas, estados }) => {
                this.zonas.set(zonas.data);
                this.estados.set(estados.data);
            });
    }

    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.showError('Complete los campos requeridos');
            return;
        }

        this.saving.set(true);
        const unidadData = normalizeProperties(this.form.getRawValue());

        this.unidadService
            .registrarUnidad(unidadData)
            .pipe(
                finalize(() => this.saving.set(false)),
                catchError(() => {
                    this.showError('Error al crear la unidad');
                    return of(null);
                })
            )
            .subscribe((data) => {
                if (data) {
                    this.showSuccess(data.message);
                    this.form.reset();
                    this.visibleChange.emit(false);
                    this.unidadCreada.emit();
                }
            });
    }

    onCancel(): void {
        this.form.reset();
        this.visibleChange.emit(false);
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
