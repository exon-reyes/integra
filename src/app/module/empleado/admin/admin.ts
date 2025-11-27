import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { EmpleadoService } from '@/core/services/organizacion/empleado.service';
import { ZonaService } from '@/core/services/ubicacion/zona.service';
import { InfoBasicaEmpleado } from '@/models/organizacion/empleado';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Panel } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { TitleComponent } from '@/shared/component/title/title.component';
import { HasPermissionDirective } from '@/core/security/HasPermissionDirective';
import { Autoridades } from '@/config/Autoridades';
import { JWTService } from '@/core/security/JWTService';
import { EmpleadoExcelGenerator } from './empleado-excel-generator';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-admin',
    imports: [CommonModule, TableModule, IconField, InputIcon, InputText, Button, FormsModule, MultiSelectModule, Panel, TitleComponent, HasPermissionDirective, DialogModule, Select],
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
    mostrarModal = false;
    supervisores: InfoBasicaEmpleado[] = [];
    supervisorSeleccionado: number | null = null;
    zonas: any[] = [];
    zonaSeleccionada: number | null = null;
    filtroActivo = false;
    protected readonly Autoridades = Autoridades;
    private securityService = inject(JWTService);
    private empleadoService = inject(EmpleadoService);
    private zonaService = inject(ZonaService);

    get numEmpleadosActivos() {
        return this.empleados().filter((z) => z.estatus === 'A').length;
    }

    get numEmpleadosInactivos() {
        return this.empleados().filter((z) => z.estatus === 'B').length;
    }

    get numEmpleadosReingreso() {
        return this.empleados().filter((z) => z.estatus === 'R').length;
    }

    get puedeUsarFiltroAvanzado() {
        const empleadoId = this.securityService.getUser().empleadoId;
        return !(this.securityService.hasAuthority(Autoridades.RESTRINGIR_CONSULTA_SUPERVISOR_EMPL) && empleadoId);
    }

    ngOnInit() {
        this.loadEmpleados();
    }

    loadEmpleados() {
        const empleadoId = this.securityService.getUser().empleadoId;

        if (this.securityService.hasAuthority(Autoridades.RESTRINGIR_CONSULTA_SUPERVISOR_EMPL) && empleadoId) {
            const params = {
                idSupervisor: empleadoId
            };
            this.empleadoService.obtenerEmpleadosFiltrados(params).subscribe({
                next: (response) => {
                    this.empleados.set(response.data);
                    this.loading.set(false);
                    this.extractUnidadesFromData(this.empleados());
                    this.extractPuestosFromData(this.empleados());
                    this.extractEstatusFromData(this.empleados());
                },
                error: () => this.loading.set(false)
            });
        } else {
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
        if (!this.securityService.hasAuthority(Autoridades.VER_INDICADORES_EMPLEADOS)) {
            return;
        }
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
        const datosParaExportar = this.dt.filteredValue || this.empleados();
        EmpleadoExcelGenerator.generarExcel(datosParaExportar);
    }

    imprimir() {
        const tableElement = this.dt.el.nativeElement.querySelector('table');
        const clonedTable = tableElement.cloneNode(true) as HTMLElement;

        // Remover controles de paginación y elementos no necesarios
        const sortIcons = clonedTable.querySelectorAll('p-sorticon, .p-sortable-column-icon');
        sortIcons.forEach((icon) => icon.remove());

        const printWindow = window.open('', '_blank');

        if (printWindow) {
            const totalEmpleados = this.dt.filteredValue ? this.dt.filteredValue.length : this.empleados().length;

            printWindow.document.documentElement.innerHTML = `
                <html>
                    <head>
                        <title>Catálogo de Colaboradores</title>
                        <style>
                            body { font-family: Inter, sans-serif; margin: 20px; }
                            h1 { text-align: center; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 8px; }
                            th { background-color: #f5f5f5; font-weight: bold; }
                            tr:nth-child(even) { background-color: #f9f9f9; }
                            .inline-flex { display: inline; }
                            .pi { display: none; }
                            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
                            .footer-content { display: flex; justify-content: space-between; align-items: center; }
                        </style>
                    </head>
                    <body>
                        <h1>Catálogo de Colaboradores</h1>
                        ${clonedTable.outerHTML}
                        <div class="footer">
                            <div class="footer-content">
                                <div>Total de empleados: ${totalEmpleados}</div>
                                <div>Generado el ${new Date().toLocaleString('es-ES')}</div>
                            </div>
                        </div>
                    </body>
                </html>
            `;
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }

    mostrarFiltroAvanzado() {
        this.cargarSupervisores();
        this.cargarZonas();
        this.mostrarModal = true;
    }

    cargarSupervisores() {
        this.empleadoService.obtenerSupervisores().subscribe({
            next: (response) => {
                this.supervisores = response.data;
            },
            error: (error) => console.error('Error al cargar supervisores:', error)
        });
    }

    cargarZonas() {
        this.zonaService.obtenerZonas().subscribe({
            next: (response) => {
                this.zonas = response.data;
            },
            error: (error) => console.error('Error al cargar zonas:', error)
        });
    }

    aplicarFiltroAvanzado() {
        if (this.supervisorSeleccionado || this.zonaSeleccionada) {
            const params: any = {};
            if (this.supervisorSeleccionado) {
                params.idSupervisor = this.supervisorSeleccionado;
            }
            if (this.zonaSeleccionada) {
                params.idZona = this.zonaSeleccionada;
            }
            this.empleadoService.obtenerEmpleadosFiltrados(params).subscribe({
                next: (response) => {
                    this.empleados.set(response.data);
                    this.extractUnidadesFromData(this.empleados());
                    this.extractPuestosFromData(this.empleados());
                    this.extractEstatusFromData(this.empleados());
                    this.filtroActivo = true;
                },
                error: (error) => console.error('Error al filtrar empleados:', error)
            });
        }
        this.mostrarModal = false;
    }

    limpiarFiltros() {
        this.supervisorSeleccionado = null;
        this.zonaSeleccionada = null;
        this.filtroActivo = false;
        this.loadEmpleados();
        this.mostrarModal = false;
    }
}
