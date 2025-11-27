import { Component, inject, OnInit, signal } from '@angular/core';
import { TitleComponent } from '@/shared/component/title/title.component';
import { DatePicker } from 'primeng/datepicker';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { EmpleadoReporte } from '@/core/services/asistencia/asistencia.service';
import { CompensacionReporteQuery, CompensacionService } from '@/core/services/asistencia/compensacion.service';
import { Zona } from '@/models/ubicacion/zona';
import { InfoBasicaEmpleado } from '@/models/organizacion/empleado';
import { Unidad } from '@/models/empresa/unidad';
import { Puesto } from '@/models/empresa/puesto';
import { EmpleadoService } from '@/core/services/organizacion/empleado.service';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { PuestoService } from '@/core/services/empresa/puesto.service';
import { ZonaService } from '@/core/services/ubicacion/zona.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { fechaISOString } from '@/shared/util/date.util';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-compensaciones',
    imports: [TitleComponent, DatePicker, Panel, Select, TableModule, ButtonModule, FormsModule, DatePipe, InputText, IconField, InputIcon],
    templateUrl: './compensaciones.html',
    styleUrl: './compensaciones.scss'
})
export class Compensaciones implements OnInit {
    empleados: EmpleadoReporte[] = [];
    zonas = signal<Zona[]>([]);
    supervisores = signal<InfoBasicaEmpleado[]>([]);
    unidades = signal<Unidad[]>([]);
    puestos = signal<Puesto[]>([]);
    listaEmpleados = signal<InfoBasicaEmpleado[]>([]);
    compensaciones = signal<CompensacionReporteQuery[]>([]);
    loading = signal<boolean>(false);
    loadingExcel = signal<boolean>(false);
    // Filtros
    filtroUnidad: number;
    filtroEmpleado: number;
    filtroSupervisor: number;
    filtroZona: number;
    rangeDates: Date[] = [];

    private empleadoService = inject(EmpleadoService);
    private unidadService = inject(UnidadService);
    private puestoService = inject(PuestoService);
    private zonaService = inject(ZonaService);
    private compensacionService = inject(CompensacionService);

    constructor() {}
    ngOnInit() {
        this.cargarOpcionesFiltros();
    }

    cargarCompensacion() {
        if (!this.rangeDates || this.rangeDates.length !== 2 || !this.rangeDates[0] || !this.rangeDates[1]) {
            return;
        }
        this.loading.set(true);
        const params: any = {
            desde: fechaISOString(this.rangeDates[0]),
            hasta: fechaISOString(this.rangeDates[1])
        };

        // Only add parameters that have actual values
        if (this.filtroEmpleado) params.empleadoId = this.filtroEmpleado;
        if (this.filtroUnidad) params.unidadId = this.filtroUnidad;
        if (this.filtroZona) params.zonaId = this.filtroZona;
        if (this.filtroSupervisor) params.supervisorId = this.filtroSupervisor;

        this.compensacionService.obtenerCompensaciones(params).subscribe({
            next: (response) => {
                this.compensaciones.set(response.data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error al cargar compensaciones:', error);
                this.loading.set(false);
            }
        });
    }

    descargarExcel() {
        if (!this.rangeDates || this.rangeDates.length !== 2 || !this.rangeDates[0] || !this.rangeDates[1]) {
            return;
        }

        this.loadingExcel.set(true);
        const params: any = {
            desde: fechaISOString(this.rangeDates[0]),
            hasta: fechaISOString(this.rangeDates[1])
        };

        // Only add parameters that have actual values
        if (this.filtroEmpleado) params.empleadoId = this.filtroEmpleado;
        if (this.filtroUnidad) params.unidadId = this.filtroUnidad;
        if (this.filtroZona) params.zonaId = this.filtroZona;
        if (this.filtroSupervisor) params.supervisorId = this.filtroSupervisor;

        this.compensacionService.descargarExcel(params).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compensaciones.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.loadingExcel.set(false);
            },
            error: (error) => {
                console.error('Error al descargar Excel:', error);
                this.loadingExcel.set(false);
            }
        });
    }

    cargarOpcionesFiltros() {
        forkJoin([this.unidadService.obtenerUnidades(), this.puestoService.obtenerPuestos(), this.empleadoService.obtenerSoloEmpleados(), this.zonaService.obtenerZonas(), this.empleadoService.obtenerSupervisores()]).subscribe({
            next: ([unidadesResp, puestosResp, empleadosResp, zonaResp, superResp]) => {
                this.unidades.set(unidadesResp.data.filter((unidad) => unidad.activo));
                this.puestos.set(puestosResp.data);
                this.listaEmpleados.set(empleadosResp.data.filter((empleado) => empleado.estatus !== 'B'));
                this.zonas.set(zonaResp.data);
                this.supervisores.set(superResp.data);
            }
        });
    }
}
