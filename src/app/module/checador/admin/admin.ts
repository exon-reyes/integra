import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Button } from 'primeng/button';
import { AsistenciaService, EmpleadoReporte, EmpleadoReporteRequest } from '@/core/services/asistencia/asistencia.service';
import { FormsModule } from '@angular/forms';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { EmpleadoService } from '@/core/services/organizacion/empleado.service';
import { Dialog } from 'primeng/dialog';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Unidad } from '@/models/empresa/unidad';
import { TitleComponent } from '@/shared/component/title/title.component';
import { Panel } from 'primeng/panel';
import { PuestoService } from '@/core/services/empresa/puesto.service';
import { Puesto } from '@/models/empresa/puesto';
import { InfoBasicaEmpleado } from '@/models/organizacion/empleado';
import { fechaISOString, obtenerFinDia } from '@/shared/util/date.util';

@Component({
    selector: 'app-admin',
    imports: [TableModule, DatePipe, Button, FormsModule, Dialog, Tooltip, Select, DatePicker, TitleComponent, Panel],
    templateUrl: './admin.html'
})
export class Admin implements OnInit {
    errorCargaFoto = false;
    urlFotoSeleccionada = '';
    tituloFoto = '';
    mostrarModalFoto = false;
    empleados: EmpleadoReporte[] = [];
    expandedRows: { [key: string]: boolean } = {};
    // Modal filtros
    mostrarModalFiltros = false;
    filtros = {
        fechaInicio: '',
        fechaFin: '',
        empleados: [] as number[]
    };
    // Opciones para filtros
    opcionesEmpleados: { label: string; value: number }[] = [];
    unidades = signal<Unidad[]>([]);
    puestos = signal<Puesto[]>([]);
    listaEmpleados = signal<InfoBasicaEmpleado[]>([]);
    // Filtros
    filtroUnidad: number;
    filtroPuesto: number;
    filtroEmpleado: number;
    rangeDates: Date[] = [];
    private asistencias = inject(AsistenciaService);
    private empleadoService = inject(EmpleadoService);
    private unidadService = inject(UnidadService);
    private puestoService = inject(PuestoService);

    constructor() {}

    get jornadasAbiertas(): number {
        return this.empleados.reduce((total, emp) => total + emp.asistencias.filter((a) => !a.jornadaCerrada).length, 0);
    }

    /**
     * Maneja el error cuando la imagen no puede cargarse
     */
    onErrorImagen(): void {
        this.errorCargaFoto = true;
    }

    /**
     * Prepara y muestra el modal con la foto de asistencia.
     */
    verFoto(pathFoto: string, tipo: string, fecha: string) {
        this.errorCargaFoto = false; // Resetear estado
        this.urlFotoSeleccionada = `${this.asistencias.apiUrlImagen}/${pathFoto}`;

        const fechaFormateada = new Date(fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        this.tituloFoto = `Foto ${tipo} - ${fechaFormateada}`;
        this.mostrarModalFoto = true;
    }

    ngOnInit() {
        this.cargarOpcionesFiltros();
    }

    cargarAsistencias() {
        const params: EmpleadoReporteRequest = {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.desde = fechaISOString(today);
        params.hasta = fechaISOString(obtenerFinDia(today));

        if (this.filtroUnidad) {
            params.unidadId = this.filtroUnidad;
        }

        if (this.filtroPuesto) {
            params.puestoId = this.filtroPuesto;
        }

        if (this.filtroEmpleado) {
            params.empleadoId = this.filtroEmpleado;
        }

        if (this.rangeDates.length === 2) {
            if (this.rangeDates[1] == null) {
                return;
            }
            const [desde, hasta] = this.rangeDates;
            params.desde = desde ? fechaISOString(desde) : null;
            params.hasta = hasta ? fechaISOString(obtenerFinDia(hasta)) : null;
        }
        console.log(params);
        this.asistencias.obtenerAsistencias(params).subscribe({
            next: (value) => {
                this.empleados = value.data.map((empleado) => ({
                    ...empleado,
                    asistencias: empleado.asistencias.map((asistencia) => ({
                        ...asistencia,
                        tiempoCalculado: this.calcularTiempoEnMomento(asistencia),
                        diferenciaCalculada: this.calcularDiferenciaEnMomento(asistencia)
                    }))
                }));
            }
        });
    }
    cargarOpcionesFiltros() {
        forkJoin([this.unidadService.obtenerUnidades(), this.puestoService.obtenerPuestos(), this.empleadoService.obtenerSoloEmpleados()]).subscribe({
            next: ([unidadesResp, puestosResp, empleadosResp]) => {
                this.unidades.set(unidadesResp.data.filter((unidad) => unidad.activo));
                this.puestos.set(puestosResp.data);
                this.listaEmpleados.set(empleadosResp.data.filter((empleado) => empleado.estatus !== 'B'));
                // Cargar datos iniciales de hoy
                this.cargarAsistencias();
            }
        });
    }

    descargarExcel() {
        const params = {
            fechaInicio: this.convertirFecha(this.filtros.fechaInicio),
            fechaFin: this.convertirFecha(this.filtros.fechaFin),
            empleados: this.filtros.empleados
        };

        this.asistencias.descargarExcel(params).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporte-asistencias-detallado.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
                this.mostrarModalFiltros = false;
            }
        });
    }

    convertirFecha(fecha: string): string | null {
        if (!fecha || fecha.length !== 10) return null;
        const [dia, mes, año] = fecha.split('/');
        return `${año}-${mes}-${dia}`;
    }

    obtenerDuracionJornada(asistencia: any): number {
        if (!asistencia.jornadaCerrada) return 12; // Default para jornadas abiertas
        return asistencia.horasBrutasTrabajadas.horas + asistencia.horasBrutasTrabajadas.minutosRestantes / 60;
    }

    calcularPosicionPausa(asistencia: any, pausa: any): number {
        const inicioJornada = new Date(asistencia.inicioJornada);
        const inicioPausa = new Date(pausa.inicio);
        const tiempoTranscurrido = (inicioPausa.getTime() - inicioJornada.getTime()) / (1000 * 60 * 60);
        const duracionTotal = this.obtenerDuracionJornada(asistencia);
        return (tiempoTranscurrido / Math.ceil(duracionTotal)) * 100;
    }

    calcularAnchoPausa(asistencia: any, pausa: any): number {
        if (!pausa.fin) return 1;
        const duracionPausa = pausa.duracion.horas + pausa.duracion.minutosRestantes / 60;
        const duracionTotal = this.obtenerDuracionJornada(asistencia);
        return Math.max(1, (duracionPausa / Math.ceil(duracionTotal)) * 100);
    }

    calcularTiempoEnMomento(asistencia: any): string {
        if (asistencia.jornadaCerrada) {
            return `${asistencia.horasNetasTrabajadas.horas}h ${asistencia.horasNetasTrabajadas.minutosRestantes}m`;
        }

        const ahora = new Date();
        const inicio = new Date(asistencia.inicioJornada);
        const tiempoTranscurrido = ahora.getTime() - inicio.getTime();

        let tiempoPausas = 0;
        asistencia.pausas.forEach((pausa: any) => {
            if (pausa.fin) {
                const inicioPausa = new Date(pausa.inicio);
                const finPausa = new Date(pausa.fin);
                tiempoPausas += finPausa.getTime() - inicioPausa.getTime();
            }
        });

        const tiempoNeto = tiempoTranscurrido - tiempoPausas;
        const horas = Math.floor(tiempoNeto / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoNeto % (1000 * 60 * 60)) / (1000 * 60));

        return `${horas}h ${minutos}m (en curso)`;
    }

    calcularDiferenciaEnMomento(asistencia: any): { texto: string; clase: string } {
        if (asistencia.jornadaCerrada) {
            return {
                texto: asistencia.diferencia8HorasTrabajadasFormateada,
                clase: asistencia.diferencia8HorasTrabajadasFormateada.includes('-') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            };
        }

        const ahora = new Date();
        const inicio = new Date(asistencia.inicioJornada);
        const tiempoTranscurrido = ahora.getTime() - inicio.getTime();

        let tiempoPausas = 0;
        asistencia.pausas.forEach((pausa: any) => {
            if (pausa.fin) {
                const inicioPausa = new Date(pausa.inicio);
                const finPausa = new Date(pausa.fin);
                tiempoPausas += finPausa.getTime() - inicioPausa.getTime();
            }
        });

        const tiempoNeto = tiempoTranscurrido - tiempoPausas;
        const totalMinutos = Math.floor(tiempoNeto / (1000 * 60));
        const diferencia = totalMinutos - 480;

        if (diferencia >= 0) {
            const horas = Math.floor(diferencia / 60);
            const mins = diferencia % 60;
            return {
                texto: `+${horas}h ${mins}m`,
                clase: 'bg-green-100 text-green-800'
            };
        } else {
            const horas = Math.floor(Math.abs(diferencia) / 60);
            const mins = Math.abs(diferencia) % 60;
            return {
                texto: `-${horas}h ${mins}m`,
                clase: 'bg-red-100 text-red-800'
            };
        }
    }

    esJornadaNocturna(asistencia: any): boolean {
        if (!asistencia.inicioJornada) return false;

        const inicio = new Date(asistencia.inicioJornada);

        if (asistencia.jornadaCerrada && asistencia.finJornada) {
            const fin = new Date(asistencia.finJornada);
            return fin.getDate() !== inicio.getDate() || fin.getMonth() !== inicio.getMonth() || fin.getFullYear() !== inicio.getFullYear();
        }

        return inicio.getHours() >= 22 || inicio.getHours() <= 6;
    }
}
