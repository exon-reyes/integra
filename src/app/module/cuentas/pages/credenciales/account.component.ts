import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CuentaService } from '@/core/services/cuenta/cuenta.service';
import { Proveedor } from '@/models/cuenta/proveedor';
import { TitleComponent } from '@/shared/component/title/title.component';
import { UnidadComponent } from '@/shared/component/unidad/unidad.component';
import { TableModule } from 'primeng/table';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { DepartmentComponent } from '@/shared/component/department/department.component';
import { Departamento } from '@/models/empresa/departamento';
import { IconField } from 'primeng/iconfield';
import {
    ActualizarCredencialComponent
} from '@/modules/credencial/components/actualizar-credencial/actualizar-credencial.component';
import {
    RegistrarCredencialComponent
} from '@/modules/credencial/components/registrar-credencial/registrar-credencial.component';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Unidad } from '@/models/empresa/unidad';
import { Subject } from 'rxjs';
import { normalizeProperties } from '@/shared/util/object.util';
import { Cuenta } from '@/models/cuenta/cuenta';

export interface Filter {
    idProveedor: number;
    idUnidad?: number;
    idDepartamento?: number;
}

@Component({
    selector: 'app-account',
    imports: [
        TitleComponent,
        UnidadComponent,
        TableModule,
        SpinnerComponent,
        DepartmentComponent,
        Button,
        FormsModule,
        DatePipe,
        Dialog,
        ReactiveFormsModule,
        ActualizarCredencialComponent,
        RouterLink,
        RegistrarCredencialComponent,
        IconField,
        InputIcon,
        InputText
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit, OnDestroy {
    nuevaCredencial: boolean;
    protected unidad!: Unidad;
    protected cargandoTabla = true;
    protected abrirEditar: boolean;
    protected proveedor!: Proveedor;
    protected formulario: FormGroup;
    protected idCredencial: number;
    protected departamento!: Departamento;
    private cuentaService = inject(CuentaService);
    private formBuilder = inject(FormBuilder);
    private confirmationService = inject(ConfirmationService);
    private destroy$ = new Subject<void>();
    private readonly messageService = inject(MessageService);

    constructor(private route: ActivatedRoute) {
        this.formulario = this.formBuilder.group({
            unidad: null,
            departamento: null,
            proveedor: null,
            usuario: null,
            clave: null,
            comentario: null
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {
        let id = this.route.snapshot.params['id'];
        this.proveedor = { id: id };
        this.loadAccountsByFilter();
    }

    selectedBusiness(value: Unidad) {
        this.unidad = value;
        this.loadAccountsByFilter();
    }

    selectedDepartment(value: Departamento) {
        this.departamento = value;
        this.loadAccountsByFilter();
    }

    loadAccountsByFilter() {
        this.cargandoTabla = true;
        this.cuentaService.obtenerCuentas(normalizeProperties(this.getFilter())).subscribe({
            next: (value) => {
                this.proveedor = value.data;
                this.cargandoTabla = false;
            }
        });
    }

    abrirModalEditar(cuenta: Cuenta) {
        this.idCredencial = cuenta.id;
        this.abrirEditar = true;
    }

    eliminar(event: Event, id: number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Está seguro de que desea eliminar este registro?',
            header: 'Confirmación',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancel',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Eliminar',
                severity: 'danger'
            },

            accept: () => {
                this.cuentaService.eliminarCuenta(id).subscribe({
                    next: (value) => {
                        this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Cuenta eliminada' });
                        this.loadAccountsByFilter();
                    }
                });
            }
        });
    }

    cuentaActualizada() {
        this.abrirEditar = false;
        this.loadAccountsByFilter();
    }

    actualizarPagina() {
        this.nuevaCredencial = false;
        this.loadAccountsByFilter();
    }

    private getFilter(): Filter {
        console.log(this.proveedor);
        return {
            idProveedor: this.proveedor.id,
            idUnidad: this.unidad?.id ?? null,
            idDepartamento: this.departamento?.id ?? null
        };
    }
}
