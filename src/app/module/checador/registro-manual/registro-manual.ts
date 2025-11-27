/**
 * Componente para registro manual de asistencia en el módulo checador.
 * Permite a los administradores registrar manualmente acciones de asistencia para empleados,
 * incluyendo inicio/fin de jornadas y pausas. Se integra con WorktimeService para realizar
 * registros y maneja validación de formularios, búsqueda de empleados y selección de unidades.
 *
 * @author Sistema de Checador
 * @version 1.0.0
 */

import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';

import { WorktimeService } from '../service/worktime.service';
import { Empleado } from '@/core/services/checador/Empleado';
import { TipoPausa } from '@/core/services/checador/TipoPausa';
import { Accion } from '../app';
import { TitleComponent } from '@/shared/component/title/title.component';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { KioscoConfigService } from '../service/kiosco-config-service';

/**
 * Interfaz que representa una opción de acción para el formulario de registro de asistencia.
 * Se utiliza para poblar dropdowns o listas de selección de acciones disponibles.
 */
interface OpcionAccion {
    /** El valor de la acción del enum Accion */
    value: Accion;
    /** La etiqueta de visualización para la acción */
    label: string;
}

/**
 * Interfaz que representa los datos necesarios para registrar una acción de asistencia manual.
 * Contiene toda la información requerida para enviar un registro al servidor.
 */
interface RegistroData {
    /** ID único del empleado */
    empleadoId: number;
    /** Tipo de acción a registrar (iniciar/finalizar jornada o pausa) */
    tipoAccion: Accion;
    /** Tipo de pausa (opcional, solo para acciones de pausa) */
    pausa?: TipoPausa;
    /** Hora del registro en formato HH:MM */
    hora: string;
    /** Observaciones o comentarios del registro */
    observaciones: string;
    /** ID de la unidad donde se realiza el registro */
    unidadId: number;
    /** ID de la unidad asignada al empleado (opcional) */
    unidadAsignadaId?: number;
}

/**
 * Componente principal para el registro manual de asistencia.
 *
 * Funcionalidades principales:
 * - Búsqueda de empleados por NIP
 * - Selección de acciones basadas en el estado del empleado
 * - Registro manual de jornadas y pausas
 * - Validación de formularios y manejo de errores
 * - Integración con servicios de backend
 */
@Component({
    selector: 'app-registro-manual',
    imports: [CommonModule, ReactiveFormsModule, TitleComponent, Button, InputText, Select],
    templateUrl: './registro-manual.html'
})
export class RegistroManualComponent implements OnInit, OnDestroy {

    // ========================================================================
    // PROPIEDADES PRIVADAS
    // ========================================================================

    /** Subject para manejar la destrucción del componente y cancelar subscripciones */
    private readonly destroy$ = new Subject<void>();

    /** FormBuilder inyectado para crear formularios reactivos */
    private readonly fb = inject(FormBuilder);

    /** Servicio para operaciones relacionadas con el tiempo de trabajo */
    private readonly worktimeService = inject(WorktimeService);

    /** Servicio para configuración del kiosco */
    private readonly kioscoConfig = inject(KioscoConfigService);

    // ========================================================================
    // SEÑALES REACTIVAS (SIGNALS)
    // ========================================================================

    /** Empleado encontrado por búsqueda de NIP */
    readonly empleadoBuscado = signal<Empleado | null>(null);

    /** Indicador de carga para operaciones asíncronas */
    readonly isLoading = signal(false);

    /** Mensaje de error actual */
    readonly error = signal<string | null>(null);

    /** Mensaje de éxito actual */
    readonly success = signal<string | null>(null);

    /** Lista de unidades disponibles para el registro */
    readonly unidades = signal<any[]>([]);

    /** Indicador de carga para la obtención de unidades */
    readonly isLoadingUnidades = signal(false);

    // ========================================================================
    // CONSTANTES
    // ========================================================================

    /**
     * Tipos de pausa disponibles para seleccionar.
     * Coincide con el enum TipoPausa del backend.
     */
    readonly tiposPausa = [
        { value: 'COMIDA' as TipoPausa, label: 'Comida' },
        { value: 'OTRA' as TipoPausa, label: 'Otra' }
    ];

    // ========================================================================
    // FORMULARIOS REACTIVOS
    // ========================================================================

    /** Formulario para búsqueda de empleado por NIP */
    readonly busquedaForm = this.fb.group({
        nipBusqueda: ['', Validators.required]
    });

    /** Formulario principal para el registro de asistencia */
    readonly registroForm = this.fb.group({
        tipoAccion: ['iniciarJornada' as Accion, Validators.required],
        tipoPausa: ['COMIDA' as TipoPausa],
        hora: [this.getHoraActual(), Validators.required],
        observaciones: ['', Validators.required],
        unidadId: [null as number | null, Validators.required]
    });

    // ========================================================================
    // PROPIEDADES COMPUTADAS (COMPUTED)
    // ========================================================================

    /**
     * Acciones disponibles basadas en el estado del empleado.
     * Se recalcula automáticamente cuando cambia el empleado buscado.
     */
    readonly tiposAccion = computed(() => this.getAccionesDisponibles(this.empleadoBuscado()));

    /**
     * Texto descriptivo de la pausa activa del empleado.
     * Convierte el valor del enum a texto legible para el usuario.
     */
    readonly pausaActivaTexto = computed(() => {
        const empleado = this.empleadoBuscado();
        if (!empleado?.tipoPausa) return null;
        return this.tiposPausa.find(p => p.value === empleado.tipoPausa)?.label || empleado.tipoPausa;
    });

    // ========================================================================
    // CICLO DE VIDA DEL COMPONENTE
    // ========================================================================

    constructor() {
        this.setupMessageEffects();
    }

    ngOnInit(): void {
        this.cargarUnidades();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ========================================================================
    // MÉTODOS PÚBLICOS
    // ========================================================================

    /**
     * Busca un empleado por su NIP de asistencia.
     * Valida el formulario antes de realizar la búsqueda y maneja errores.
     */
    buscarEmpleado(): void {
        if (this.busquedaForm.invalid) {
            this.error.set('Ingrese un NIP válido');
            return;
        }

        const nip = this.busquedaForm.get('nipBusqueda')?.value;
        if (!nip) return;

        this.isLoading.set(true);
        this.error.set(null);

        this.worktimeService
            .consultarEmpleadoPorNip(nip)
            .pipe(
                takeUntil(this.destroy$),
                catchError(() => {
                    this.error.set('Error al buscar empleado');
                    return of(null);
                }),
                finalize(() => this.isLoading.set(false))
            )
            .subscribe(response => {
                if (response?.success) {
                    this.empleadoBuscado.set(response.data);
                } else {
                    this.error.set('Empleado no encontrado');
                    this.empleadoBuscado.set(null);
                }
            });
    }

    /**
     * Selecciona una acción y actualiza el formulario.
     * @param accion - La acción seleccionada por el usuario
     */
    seleccionarAccion(accion: Accion): void {
        this.registroForm.patchValue({ tipoAccion: accion });
    }

    /**
     * Procesa el registro de asistencia manual.
     * Valida el formulario, construye los datos y envía la petición al servidor.
     */
    agregarRegistro(): void {
        if (!this.validarFormulario()) {
            this.registroForm.markAllAsTouched();
            this.error.set('Complete todos los campos requeridos');
            return;
        }

        const empleado = this.empleadoBuscado()!;
        const registroData = this.buildRegistroData(empleado);

        this.isLoading.set(true);
        this.error.set(null);

        this.worktimeService
            .registroManual(registroData)
            .pipe(
                takeUntil(this.destroy$),
                catchError(() => {
                    this.error.set('Error al enviar el registro');
                    return of(null);
                }),
                finalize(() => this.isLoading.set(false))
            )
            .subscribe(response => {
                if (response?.success) {
                    this.success.set('Registro de asistencia enviado exitosamente');
                    this.limpiarFormulario();
                } else {
                    this.error.set('Error al procesar el registro');
                }
            });
    }

    // ========================================================================
    // MÉTODOS PRIVADOS
    // ========================================================================

    /**
     * Configura los efectos para mostrar y ocultar mensajes automáticamente.
     * Los mensajes de éxito se ocultan después de 3 segundos.
     * Los mensajes de error se ocultan después de 5 segundos.
     */
    private setupMessageEffects(): void {
        effect(() => {
            const msg = this.success();
            if (msg) setTimeout(() => this.success.set(null), 3000);
        });

        effect(() => {
            const msg = this.error();
            if (msg) setTimeout(() => this.error.set(null), 5000);
        });
    }

    /**
     * Determina las acciones disponibles basándose en el estado actual del empleado.
     *
     * Lógica de negocio:
     * - Sin jornada iniciada: Solo puede iniciar jornada
     * - Con jornada iniciada y sin pausa: Puede finalizar jornada o iniciar pausa
     * - Con jornada iniciada y en pausa: Puede finalizar jornada o finalizar pausa
     *
     * @param empleado - El empleado para el cual determinar las acciones
     * @returns Array de opciones de acción disponibles
     */
    private getAccionesDisponibles(empleado: Empleado | null): OpcionAccion[] {
        if (!empleado) return [];

        // Sin jornada iniciada: solo puede iniciar jornada
        if (!empleado.jornadaIniciada) {
            return [{ value: 'iniciarJornada', label: 'Iniciar Jornada' }];
        }

        // Con jornada iniciada: opciones de finalización siempre disponibles
        const opciones: OpcionAccion[] = [
            { value: 'finalizarJornada', label: 'Finalizar Jornada' },
            { value: 'finalizarJornadaDeposito', label: 'Finalizar Jornada (Depósito)' }
        ];

        // Manejo de pausas basado en el estado actual
        if (!empleado.tipoPausa) {
            // No está en pausa: puede iniciar pausa
            opciones.push({ value: 'iniciarPausa', label: 'Iniciar Pausa' });
        } else {
            // Está en pausa: puede finalizar pausa
            opciones.push({ value: 'finalizarPausa', label: 'Finalizar Pausa' });
        }

        return opciones;
    }

    /**
     * Construye el objeto de datos para enviar al servidor.
     * Combina los datos del formulario con la información del empleado.
     *
     * @param empleado - El empleado para el cual crear el registro
     * @returns Objeto con todos los datos necesarios para el registro
     */
    private buildRegistroData(empleado: Empleado): RegistroData {
        const formValue = this.registroForm.value;
        const tipoPausa = this.getTipoPausa(formValue.tipoAccion!, empleado);

        return {
            empleadoId: empleado.id,
            tipoAccion: formValue.tipoAccion!,
            pausa: tipoPausa,
            hora: formValue.hora!,
            observaciones: formValue.observaciones!,
            unidadId: formValue.unidadId!,
            unidadAsignadaId: empleado.unidadAsignadaId
        };
    }

    /**
     * Determina el tipo de pausa basándose en la acción y el estado del empleado.
     *
     * Lógica:
     * - Para iniciar pausa: usa el valor seleccionado en el formulario
     * - Para finalizar pausa: usa el tipo de pausa activa del empleado
     * - Para otras acciones: no requiere tipo de pausa
     *
     * @param accion - La acción que se va a registrar
     * @param empleado - El empleado para el cual determinar el tipo de pausa
     * @returns El tipo de pausa o undefined si no aplica
     */
    private getTipoPausa(accion: Accion, empleado: Empleado): TipoPausa | undefined {
        if (accion === 'iniciarPausa') {
            return this.registroForm.get('tipoPausa')?.value as TipoPausa;
        }
        if (accion === 'finalizarPausa') {
            return empleado.tipoPausa as TipoPausa;
        }
        return undefined;
    }

    /**
     * Valida que todos los campos requeridos estén completos.
     * No usa computed para evitar problemas con formularios reactivos.
     *
     * @returns true si el formulario es válido, false en caso contrario
     */
    private validarFormulario(): boolean {
        const empleado = this.empleadoBuscado();
        const tipoAccion = this.registroForm.get('tipoAccion')?.value;
        const unidadId = this.registroForm.get('unidadId')?.value;
        const hora = this.registroForm.get('hora')?.value;
        const observaciones = this.registroForm.get('observaciones')?.value;

        // Validaciones básicas: empleado, acción, unidad, hora y observaciones
        if (!empleado || !tipoAccion || !unidadId || !hora || !observaciones) {
            return false;
        }

        // Validación específica para iniciar pausa: debe tener tipo de pausa seleccionado
        if (tipoAccion === 'iniciarPausa') {
            const tipoPausa = this.registroForm.get('tipoPausa')?.value;
            return !!tipoPausa;
        }

        return true;
    }

    /**
     * Limpia todos los formularios y resetea el estado del componente.
     * Se ejecuta después de un registro exitoso.
     */
    private limpiarFormulario(): void {
        this.busquedaForm.reset();
        this.registroForm.patchValue({
            tipoAccion: 'iniciarJornada',
            tipoPausa: 'COMIDA',
            hora: this.getHoraActual(),
            observaciones: '',
            unidadId: null
        });
        this.empleadoBuscado.set(null);
    }

    /**
     * Carga la lista de unidades disponibles desde el servidor.
     * Se ejecuta al inicializar el componente.
     */
    private cargarUnidades(): void {
        this.isLoadingUnidades.set(true);

        this.kioscoConfig
            .obtenerUnidadesKiosco()
            .pipe(
                takeUntil(this.destroy$),
                catchError(() => {
                    this.error.set('Error al cargar unidades');
                    return of({ success: false, data: [] });
                }),
                finalize(() => this.isLoadingUnidades.set(false))
            )
            .subscribe(response => {
                if (response.success) {
                    this.unidades.set(response.data || []);
                }
            });
    }

    /**
     * Obtiene la hora actual en formato HH:MM.
     * Se usa como valor por defecto en el campo de hora.
     *
     * @returns Hora actual en formato HH:MM
     */
    private getHoraActual(): string {
        return new Date().toTimeString().split(' ')[0].substring(0, 5);
    }
}
