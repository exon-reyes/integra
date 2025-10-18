import {Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Table, TableModule} from 'primeng/table';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {EmpleadoService} from '@/core/services/organizacion/empleado.service';
import {InfoBasicaEmpleado} from '@/models/organizacion/empleado';
import {Button} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {MultiSelectModule} from 'primeng/multiselect';
import {Panel} from "primeng/panel";
import {ExcelGeneratorService} from '@/shared/service/excel-generator.service';
import {TitleComponent} from "@/shared/component/title/title.component";

@Component({
    selector: 'app-admin',
    imports: [CommonModule, TableModule, IconField, InputIcon, InputText, Button, FormsModule, MultiSelectModule, Panel, TitleComponent],
    templateUrl: './admin.html',
    styleUrl: './admin.scss'
})
export class Admin implements OnInit {
    @ViewChild('dt') dt!: Table;
    empleados = signal<InfoBasicaEmpleado[]>([]);
    loading = signal(true);
    searchValue = '';
    selectedUnidad: string[] = [];
    selectedPuesto: string[] = [];
    selectedEstatus: string[] = [];
    unidades: { name: string; code: string }[] = [];
    puestos: { name: string; code: string }[] = [];
    estatusOptions: { name: string; code: string }[] = [
        { name: 'Activo', code: 'A' },
        {
            name: 'Reingreso',
            code: 'R'
        },
        { name: 'Baja', code: 'B' }
    ];

    private empleadoService = inject(EmpleadoService);
    private excelGeneratorService = inject(ExcelGeneratorService);

    get numEmpleadosActivos() {
        return this.empleados().filter((z) => z.estatus === 'A').length;
    }

    get numEmpleadosInactivos() {
        return this.empleados().filter((z) => z.estatus === 'B').length;
    }

    get numEmpleadosReingreso() {
        return this.empleados().filter((z) => z.estatus === 'R').length;
    }

    ngOnInit() {
        this.loadEmpleados();
    }

    loadEmpleados() {
        this.empleadoService.obtenerEmpleados().subscribe({
            next: (response) => {
                this.empleados.set(response.data);
                this.loading.set(false);
                this.extractUnidadesFromData(this.empleados());
                this.extractPuestosFromData(this.empleados());
                this.extractEstatusFromData(this.empleados());
            },
            error: () => this.loading.set(false)
        });
    }

    extractUnidadesFromData(data: InfoBasicaEmpleado[]) {
        const unidadesUnicas = [...new Set(data.map((emp) => emp.unidadNombreCompleto))];
        this.unidades = unidadesUnicas
            .filter((u) => u) // Filtrar valores null/undefined
            .map((unidad) => ({
                name: unidad,
                code: unidad
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    extractPuestosFromData(data: InfoBasicaEmpleado[]) {
        const puestosUnicos = [...new Set(data.map((emp) => emp.puestoNombre))];
        this.puestos = puestosUnicos
            .filter((p) => p) // Filtrar valores null/undefined
            .map((puesto) => ({
                name: puesto,
                code: puesto
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    extractEstatusFromData(data: InfoBasicaEmpleado[]) {
        const estatusUnicos = [...new Set(data.map((emp) => emp.estatus))];
        this.estatusOptions = estatusUnicos
            .filter((e) => e)
            .map((estatus) => ({
                name: estatus === 'A' ? 'Activo' : estatus === 'R' ? 'Reingreso' : 'Baja',
                code: estatus
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    onUnidadChange(value: string[]) {
        this.selectedUnidad = value;
        this.dt.filter(value, 'unidadNombreCompleto', 'in');
    }

    onPuestoChange(value: string[]) {
        this.selectedPuesto = value;
        this.dt.filter(value, 'puestoNombre', 'in');
    }

    onEstatusChange(value: string[]) {
        this.selectedEstatus = value;
        this.dt.filter(value, 'estatus', 'in');
    }

    onFilter(event: any) {
        const filteredData = event.filteredValue || this.empleados();
        this.extractUnidadesFromData(filteredData);
        this.extractPuestosFromData(filteredData);
        this.extractEstatusFromData(filteredData);
    }

    sincronizar() {
        this.empleadoService.removeCache();
        this.loadEmpleados();
    }

    exportarExcel() {
        const datosAExportar = this.dt.filteredValue || this.empleados();
        this.excelGeneratorService.generarExcelEmpleados(datosAExportar);
    }
}
