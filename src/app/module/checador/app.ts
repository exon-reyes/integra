import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { catchError, finalize, Observable, of, retry, Subject, switchMap, takeUntil, timeout, TimeoutError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { WebcamImage, WebcamInitError, WebcamModule } from 'ngx-webcam';
import { WorktimeService } from '@/module/checador/service/worktime.service';
import { Empleado } from '@/core/services/checador/Empleado';
import { TipoPausa } from '@/core/services/checador/TipoPausa';
import { KioscoConfigService } from '@/module/checador/service/kiosco-config-service';

export type Accion = 'iniciarJornada' | 'finalizarJornada' | 'iniciarPausa' | 'finalizarPausa';

interface ApiErrorResponse {
    message?: string;
}

interface ConfiguracionSistema {
    unidadId: number;
    requiereCamara: boolean;
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, WebcamModule, NgOptimizedImage],
    templateUrl: './app.html',
    styleUrl: './app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, AfterViewInit, OnDestroy {
    // Constantes estáticas para evitar recreación
    private static readonly MAX_LENGTH = 8;
    private static readonly TIMEOUT_MS = 10000; // 10s timeout
    private static readonly RETRY_COUNT = 2;
    private static readonly CODIGO_ADMIN = '1234'; // Código para activar modo sin cámara
    private static readonly FECHA_OPTIONS: Intl.DateTimeFormatOptions = Object.freeze({
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    private static readonly HORA_OPTIONS: Intl.DateTimeFormatOptions = Object.freeze({
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    // Computed para máscara (evita recálculos innecesarios)
    readonly mascara = computed(() => '*'.repeat(this.valorIngresado().length));
    // Computed para modo sin cámara
    readonly modoSinCamara = computed(() => !this.configuracion().requiereCamara);
    // ========== SIGNALS PARA MEJOR RENDIMIENTO ==========
    private readonly vistaActualSignal = signal<'reloj' | 'webcam' | 'empleado'>('reloj');
    // ========== COMPUTED PROPERTIES ==========
    readonly vistaActual = this.vistaActualSignal.asReadonly();
    private readonly empleadoSignal = signal<Empleado | null>(null);
    readonly empleado = this.empleadoSignal.asReadonly();
    private readonly isLoadingSignal = signal(false);
    readonly isLoading = this.isLoadingSignal.asReadonly();
    private readonly isUploadingSignal = signal(false);
    readonly isUploading = this.isUploadingSignal.asReadonly();
    private readonly errorApiSignal = signal<string | null>(null);
    readonly errorApi = this.errorApiSignal.asReadonly();
    private readonly accionActualSignal = signal<Accion | null>(null);
    readonly accionActual = this.accionActualSignal.asReadonly();
    private readonly pausaActualSignal = signal<TipoPausa | null>(null);
    readonly pausaActual = this.pausaActualSignal.asReadonly();
    // Webcam signals
    private readonly fotoCapturadaSignal = signal<WebcamImage | null>(null);
    readonly fotoCapturada = this.fotoCapturadaSignal.asReadonly();
    private readonly webcamErrorSignal = signal<string | null>(null);
    readonly webcamError = this.webcamErrorSignal.asReadonly();
    private readonly cameraPermissionGrantedSignal = signal(false);
    readonly cameraPermissionGranted = this.cameraPermissionGrantedSignal.asReadonly();
    private readonly countdownSignal = signal<number | null>(null);
    readonly countdown = this.countdownSignal.asReadonly();
    // Clock signals
    private readonly fechaFormateadaSignal = signal('');
    readonly fechaFormateada = this.fechaFormateadaSignal.asReadonly();
    private readonly horaFormateadaSignal = signal('');
    readonly horaFormateada = this.horaFormateadaSignal.asReadonly();
    // Keypad signals
    private readonly valorIngresadoSignal = signal('');
    readonly valorIngresado = this.valorIngresadoSignal.asReadonly();
    // UI signals
    private readonly showSuccessMessageSignal = signal(false);
    readonly showSuccessMessage = this.showSuccessMessageSignal.asReadonly();
    private readonly successMessageTextSignal = signal('');
    readonly successMessageText = this.successMessageTextSignal.asReadonly();
    // Configuration signals
    private readonly configuracionSignal = signal<ConfiguracionSistema>(this.cargarConfiguracionDesdeStorage());
    readonly configuracion = this.configuracionSignal.asReadonly();
    private readonly mostrarConfigSignal = signal(false);
    readonly mostrarConfig = this.mostrarConfigSignal.asReadonly();
    private readonly codigoConfigSignal = signal('');
    readonly codigoConfig = this.codigoConfigSignal.asReadonly();
    // Unit selection signals
    private readonly unidadesSignal = signal<any[]>([]);
    readonly unidades = this.unidadesSignal.asReadonly();
    private readonly unidadSeleccionadaSignal = signal<any | null>(null);
    readonly unidadSeleccionada = this.unidadSeleccionadaSignal.asReadonly();
    private readonly mostrarModalUnidadSignal = signal(false);
    readonly mostrarModalUnidad = this.mostrarModalUnidadSignal.asReadonly();
    private readonly isLoadingUnidadesSignal = signal(false);
    readonly isLoadingUnidades = this.isLoadingUnidadesSignal.asReadonly();
    // Configuration modal signals
    private readonly mostrarModalConfiguracionSignal = signal(false);
    readonly mostrarModalConfiguracion = this.mostrarModalConfiguracionSignal.asReadonly();
    private readonly mostrarInputResetSignal = signal(false);
    readonly mostrarInputReset = this.mostrarInputResetSignal.asReadonly();
    private readonly codigoResetSignal = signal('');
    readonly codigoReset = this.codigoResetSignal.asReadonly();
    private readonly isLoadingResetSignal = signal(false);
    readonly isLoadingReset = this.isLoadingResetSignal.asReadonly();
    // Sin Cámara signals
    private readonly mostrarModalSinCamaraSignal = signal(false);
    readonly mostrarModalSinCamara = this.mostrarModalSinCamaraSignal.asReadonly();
    private readonly codigoSinCamaraSignal = signal('');
    readonly codigoSinCamara = this.codigoSinCamaraSignal.asReadonly();
    private readonly isLoadingSinCamaraSignal = signal(false);
    readonly isLoadingSinCamara = this.isLoadingSinCamaraSignal.asReadonly();
    // ========== OPTIMIZACIONES DE RENDIMIENTO ==========
    private readonly trigger = new Subject<void>();
    private readonly destroy$ = new Subject<void>();
    private capturaAutomaticaTimerId?: number;
    private countdownIntervalId?: number;
    private intervalId?: number;
    @ViewChild('codeInput') private codeInput!: ElementRef<HTMLInputElement>;
    @ViewChild('resetInput') private resetInput!: ElementRef<HTMLInputElement>;
    @ViewChild('sinCamaraInput') private sinCamaraInput!: ElementRef<HTMLInputElement>;
    private readonly checadorService = inject(WorktimeService);
    private readonly kioscoConfig = inject(KioscoConfigService);
    // Memoización para formateo de fecha/hora
    private fechaCache = { date: '', formatted: '' };
    private horaCache = { time: '', formatted: '' };
    private readonly solicitarCodigo$ = new Subject<void>();
    private readonly solicitarCodigoConfiguracion$ = this.solicitarCodigo$
        .pipe(
            switchMap(() => {
                const unidadId = this.configuracionSignal().unidadId;
                if (!unidadId) return of(null);

                this.isLoadingSignal.set(true);
                this.errorApiSignal.set(null);

                return this.kioscoConfig.solicitarCodigo(unidadId).pipe(
                    timeout(5000),
                    catchError(() => {
                        this.errorApiSignal.set('Error al solicitar código');
                        return of(null);
                    }),
                    finalize(() => this.isLoadingSignal.set(false))
                );
            }),
            takeUntil(this.destroy$)
        )
        .subscribe((response) => {
            if (response?.success) {
                this.mostrarMensajeExito('Código de configuración solicitado');
                this.cerrarModalConfiguracion();
            }
        });

    public get triggerObservable(): Observable<void> {
        return this.trigger.asObservable();
    }

    async ngOnInit(): Promise<void> {
        this.actualizarFechaHora();
        this.intervalId = window.setInterval(() => this.actualizarFechaHora(), 1000);

        // Verificar si existe unidad configurada
        await this.verificarUnidadConfiguracion();

        // Solo verificar permisos si no está en modo sin cámara
        if (!this.configuracionSignal().requiereCamara) {
            await this.verificarPermisosCamara().catch(() => {
                console.warn('No se pudieron verificar permisos de cámara');
            });
        } else {
            // Si está en modo sin cámara, marcar como que no necesita permisos
            this.cameraPermissionGrantedSignal.set(true);
        }
    }

    ngAfterViewInit(): void {
        this.enfocarInputSiEsNecesario();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.limpiarTodosLosTimers();
    }

    // ========== MÉTODOS DE TECLADO OPTIMIZADOS ==========
    agregarDigito(digito: number): void {
        const valorActual = this.valorIngresadoSignal();
        if (valorActual.length < App.MAX_LENGTH) {
            this.valorIngresadoSignal.set(valorActual + digito.toString());
        }
    }

    borrar(): void {
        const valorActual = this.valorIngresadoSignal();
        if (valorActual.length > 0) {
            this.valorIngresadoSignal.set(valorActual.slice(0, -1));
        }
        this.enfocarInputSiEsNecesario();
    }

    // Optimización: evitar regex en hot path
    @HostListener('window:keydown', ['$event'])
    manejarTeclaPresionada(evento: KeyboardEvent): void {
        if (this.vistaActualSignal() !== 'reloj') return;

        const tecla = evento.key;

        // Optimización: comparación directa más rápida que regex
        if (tecla >= '0' && tecla <= '9') {
            evento.preventDefault();
            this.agregarDigito(Number(tecla));
        } else if (tecla === 'Backspace') {
            evento.preventDefault();
            this.borrar();
        } else if (tecla === 'Enter') {
            evento.preventDefault();
            this.aceptar();
        }
    }

    // ========== AUTENTICACIÓN CON ALTA DISPONIBILIDAD ==========
    aceptar(): void {
        const valor = this.valorIngresadoSignal();
        if (valor.length === 0 || this.isLoadingSignal()) return;

        this.isLoadingSignal.set(true);
        this.errorApiSignal.set(null);

        this.checadorService
            .consultarEmpleadoPorNip(valor)
            .pipe(
                timeout(App.TIMEOUT_MS), // Timeout para evitar esperas infinitas
                retry(App.RETRY_COUNT), // Reintentos automáticos
                takeUntil(this.destroy$), // Cleanup automático
                catchError((error: HttpErrorResponse) => {
                    console.error('Error en consulta:', error);
                    this.errorApiSignal.set(this.obtenerMensajeErrorConsulta(error));
                    return of(null);
                }),
                finalize(() => this.isLoadingSignal.set(false))
            )
            .subscribe((response) => {
                this.valorIngresadoSignal.set('');
                if (response?.success) {
                    this.empleadoSignal.set(response.data);
                    this.vistaActualSignal.set('empleado');
                }
                this.enfocarInputSiEsNecesario();
            });
    }

    // ========== CAPTURA DE FOTO OPTIMIZADA ==========
    iniciarCapturaFoto(accion: Accion, tipoPausa?: TipoPausa): void {
        // Si está en modo sin cámara, procesar directamente
        if (!this.configuracionSignal().requiereCamara) {
            this.accionActualSignal.set(accion);
            this.pausaActualSignal.set(tipoPausa || null);
            this.procesarSinCamara();
            return;
        }

        // Código original para modo con cámara
        if (!this.cameraPermissionGrantedSignal()) {
            this.errorApiSignal.set('Se requieren permisos de cámara para continuar.');
            return;
        }

        this.accionActualSignal.set(accion);
        this.pausaActualSignal.set(tipoPausa || null);
        this.vistaActualSignal.set('webcam');
        this.resetearCamara();
        this.iniciarCuentaRegresiva();
    }

    tomarFoto(): void {
        this.trigger.next();
    }

    handleImage(webcamImage: WebcamImage): void {
        this.limpiarTimers();
        this.fotoCapturadaSignal.set(webcamImage);
        this.procesarImagen(webcamImage);
    }

    // ========== MÉTODOS PÚBLICOS PARA TEMPLATE ==========
    handleInitError(error: WebcamInitError): void {
        this.webcamErrorSignal.set(error.message);
        console.error(error);
        this.limpiarTimers();
    }

    reintentarCaptura(): void {
        const accion = this.accionActualSignal();
        const pausa = this.pausaActualSignal();
        if (accion) {
            this.iniciarCapturaFoto(accion, pausa || undefined);
        }
    }

    regresarAVistaEmpleado(): void {
        this.vistaActualSignal.set('empleado');
        this.resetearCamara();
        this.accionActualSignal.set(null);
        this.pausaActualSignal.set(null);
        this.limpiarTimers();
    }

    regresarAlReloj(): void {
        this.vistaActualSignal.set('reloj');
        this.resetearEstado();
        this.limpiarTimers();
        this.enfocarInputSiEsNecesario();
    }

    toggleConfiguracion(): void {
        this.mostrarConfigSignal.set(!this.mostrarConfigSignal());
        this.codigoConfigSignal.set('');
    }

    agregarDigitoConfig(digito: number): void {
        const valorActual = this.codigoConfigSignal();
        if (valorActual.length < 4) {
            this.codigoConfigSignal.set(valorActual + digito.toString());
        }
    }

    borrarConfig(): void {
        const valorActual = this.codigoConfigSignal();
        if (valorActual.length > 0) {
            this.codigoConfigSignal.set(valorActual.slice(0, -1));
        }
    }

    aplicarConfiguracion(): void {
        const codigo = this.codigoConfigSignal();
        if (codigo === App.CODIGO_ADMIN) {
            const configActual = this.configuracionSignal();
            const nuevaConfig = {
                ...configActual,
                requiereCamara: !configActual.requiereCamara
            };

            this.configuracionSignal.set(nuevaConfig);
            this.guardarConfiguracionEnStorage(nuevaConfig); // Guardar en localStorage

            this.mostrarConfigSignal.set(false);
            this.codigoConfigSignal.set('');

            const mensaje = nuevaConfig.requiereCamara ? 'Modo con cámara activado' : 'Modo sin cámara activado';
            this.mostrarMensajeExito(mensaje);
        } else {
            this.errorApiSignal.set('Código incorrecto');
            setTimeout(() => this.errorApiSignal.set(null), 2000);
        }
    }

    seleccionarUnidad(unidad: any): void {
        this.unidadSeleccionadaSignal.set(unidad);
    }

    guardarUnidadSeleccionada(): void {
        const unidad = this.unidadSeleccionadaSignal();
        if (!unidad) return;

        try {
            // Guardar en localStorage
            localStorage.setItem('unidad_reloj', JSON.stringify(unidad));

            // Actualizar configuración
            const nuevaConfig: ConfiguracionSistema = {
                unidadId: unidad.id,
                requiereCamara: unidad.requiereCamara ?? true
            };

            this.configuracionSignal.set(nuevaConfig);
            this.mostrarModalUnidadSignal.set(false);
            this.unidadSeleccionadaSignal.set(null);
        } catch (error) {
            console.error('Error al guardar unidad:', error);
            this.errorApiSignal.set('Error al guardar la unidad seleccionada');
        }
    }

    // ========== MODAL DE CONFIGURACIÓN ==========
    abrirModalConfiguracion(): void {
        this.mostrarModalConfiguracionSignal.set(true);
    }

    cerrarModalConfiguracion(): void {
        this.mostrarModalConfiguracionSignal.set(false);
        this.mostrarInputResetSignal.set(false);
        this.codigoResetSignal.set('');
    }

    activarInputReset(): void {
        this.mostrarInputResetSignal.set(true);
        setTimeout(() => {
            this.resetInput?.nativeElement.focus();
        }, 100);
    }

    agregarDigitoReset(digito: number): void {
        const valorActual = this.codigoResetSignal();
        if (valorActual.length < 5) {
            this.codigoResetSignal.set(valorActual + digito.toString());
        }
    }

    borrarDigitoReset(): void {
        const valorActual = this.codigoResetSignal();
        if (valorActual.length > 0) {
            this.codigoResetSignal.set(valorActual.slice(0, -1));
        }
    }

    ejecutarReset(): void {
        const codigo = this.codigoResetSignal();
        const unidadId = this.configuracionSignal().unidadId;

        if (codigo.length !== 5 || !unidadId) return;

        this.isLoadingResetSignal.set(true);
        this.errorApiSignal.set(null);

        this.kioscoConfig
            .usarCodigoConfiguracion(unidadId, codigo)
            .pipe(
                timeout(5000),
                takeUntil(this.destroy$),
                finalize(() => this.isLoadingResetSignal.set(false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.success) {
                        localStorage.removeItem('unidad_reloj');
                        location.reload();
                    }
                },
                error: (error: HttpErrorResponse) => {
                    this.errorApiSignal.set(error.status === 409 ? 'Código inválido' : 'Error de reset');
                }
            });
    }

    sincronizarConfiguracion(): void {
        const unidadId = this.configuracionSignal().unidadId;
        if (!unidadId) return;

        this.isLoadingSignal.set(true);
        this.errorApiSignal.set(null);

        this.kioscoConfig
            .obtenerUnidadKiosco(unidadId)
            .pipe(
                timeout(5000),
                takeUntil(this.destroy$),
                finalize(() => this.isLoadingSignal.set(false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.success && response.data) {
                        const nuevaConfig: ConfiguracionSistema = {
                            unidadId: response.data.id,
                            requiereCamara: response.data.requiereCamara ?? true
                        };
                        this.configuracionSignal.set(nuevaConfig);
                        localStorage.setItem('unidad_reloj', JSON.stringify(response.data));
                        this.cerrarModalConfiguracion();
                    }
                },
                error: () => this.errorApiSignal.set('Error al sincronizar')
            });
    }

    // ========== MODAL SIN CÁMARA ==========
    activarCodigoSinCamara(): void {
        this.mostrarModalSinCamaraSignal.set(true);
        this.codigoSinCamaraSignal.set('');
        this.errorApiSignal.set(null);
        setTimeout(() => {
            this.sinCamaraInput?.nativeElement.focus();
        }, 100);
    }

    cerrarModalSinCamara(): void {
        this.mostrarModalSinCamaraSignal.set(false);
        this.codigoSinCamaraSignal.set('');
        this.errorApiSignal.set(null);
    }

    agregarDigitoSinCamara(digito: number): void {
        const valorActual = this.codigoSinCamaraSignal();
        if (valorActual.length < 5) {
            this.codigoSinCamaraSignal.set(valorActual + digito.toString());
        }
    }

    borrarDigitoSinCamara(): void {
        const valorActual = this.codigoSinCamaraSignal();
        if (valorActual.length > 0) {
            this.codigoSinCamaraSignal.set(valorActual.slice(0, -1));
        }
    }

    confirmarCodigoSinCamara(): void {
        const codigo = this.codigoSinCamaraSignal();
        const unidadId = this.configuracionSignal().unidadId;

        if (codigo.length !== 5 || !unidadId) return;

        this.isLoadingSinCamaraSignal.set(true);
        this.errorApiSignal.set(null);

        this.kioscoConfig
            .usarCodigoConfiguracion(unidadId, codigo)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isLoadingSinCamaraSignal.set(false))
            )
            .subscribe({
                next: (response) => {
                    if (response?.success) {
                        const nuevaConfig: ConfiguracionSistema = {
                            unidadId: unidadId,
                            requiereCamara: false
                        };
                        this.configuracionSignal.set(nuevaConfig);

                        // Actualizar localStorage manteniendo otros datos
                        const unidadActual = JSON.parse(localStorage.getItem('unidad_reloj') || '{}');
                        unidadActual.requiereCamara = false;
                        localStorage.setItem('unidad_reloj', JSON.stringify(unidadActual));

                        this.cerrarModalSinCamara();
                        this.mostrarMensajeExito('Modo sin cámara activado');
                    }
                },
                error: (error: HttpErrorResponse) => {
                    this.errorApiSignal.set(error.status === 409 ? 'Código inválido' : 'Error al confirmar código');
                }
            });
    }

    solicitarCodigoConfiguracion(): void {
        this.solicitarCodigo$.next();
    }

    // ========== OPTIMIZACIONES DE FECHA/HORA ==========
    private actualizarFechaHora(): void {
        const ahora = new Date();
        const fechaKey = ahora.toDateString();
        const horaKey = `${ahora.getHours()}:${ahora.getMinutes()}:${ahora.getSeconds()}`;

        // Cache para fecha (cambia menos frecuentemente)
        if (this.fechaCache.date !== fechaKey) {
            this.fechaCache.date = fechaKey;
            this.fechaCache.formatted = ahora.toLocaleDateString('es-ES', App.FECHA_OPTIONS);
            this.fechaFormateadaSignal.set(this.fechaCache.formatted);
        }

        // Cache para hora
        if (this.horaCache.time !== horaKey) {
            this.horaCache.time = horaKey;
            this.horaCache.formatted = ahora.toLocaleTimeString('es-ES', App.HORA_OPTIONS);
            this.horaFormateadaSignal.set(this.horaCache.formatted);
        }
    }

    // ========== OPTIMIZACIONES DE CÁMARA ==========
    private async verificarPermisosCamara(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 320 },
                    height: { ideal: 240 }
                }
            });
            this.cameraPermissionGrantedSignal.set(true);
            stream.getTracks().forEach((track) => track.stop());
        } catch (error) {
            this.cameraPermissionGrantedSignal.set(false);
            console.warn('Permisos de cámara no otorgados:', error);
        }
    }

    private iniciarCuentaRegresiva(): void {
        this.countdownSignal.set(5);

        this.countdownIntervalId = window.setInterval(() => {
            const current = this.countdownSignal();
            if (current !== null && current > 0) {
                this.countdownSignal.set(current - 1);
            } else {
                this.countdownSignal.set(null);
                this.limpiarCountdownTimer();
            }
        }, 1000);

        this.capturaAutomaticaTimerId = window.setTimeout(() => {
            this.tomarFoto();
        }, 5000);
    }

    // ========== PROCESAMIENTO DE IMAGEN CON ALTA DISPONIBILIDAD ==========
    private procesarImagen(webcamImage: WebcamImage): void {
        const empleado = this.empleadoSignal();
        const accion = this.accionActualSignal();

        if (!empleado || !accion) {
            this.errorApiSignal.set('Error: Faltan datos para procesar la solicitud.');
            return;
        }

        this.isUploadingSignal.set(true);
        this.errorApiSignal.set(null);

        const { apiCall, successMessage } = this.obtenerConfiguracionAccion(webcamImage);
        if (!apiCall) return;

        apiCall
            .pipe(
                timeout(App.TIMEOUT_MS * 2), // Más tiempo para upload
                takeUntil(this.destroy$),
                finalize(() => this.isUploadingSignal.set(false)),
                catchError((error: HttpErrorResponse) => {
                    console.error('Error en procesamiento:', error);
                    this.errorApiSignal.set(this.obtenerMensajeErrorProcesamiento(error));
                    return of(null);
                })
            )
            .subscribe((response) => {
                if (response?.success) {
                    this.mostrarMensajeExito(successMessage);
                }
            });
    }

    private obtenerConfiguracionAccion(webcamImage: WebcamImage): { apiCall: Observable<any> | null; successMessage: string } {
        const empleado = this.empleadoSignal()!;
        const accion = this.accionActualSignal()!;
        const pausa = this.pausaActualSignal();
        const foto = webcamImage.imageAsDataUrl;
        const unidadId = this.configuracionSignal().unidadId;

        // Optimización: switch más eficiente que objeto lookup
        switch (accion) {
            case 'iniciarJornada':
                return {
                    apiCall: this.checadorService.iniciarJornada(empleado.id, foto, unidadId),
                    successMessage: '¡Jornada iniciada con éxito!'
                };
            case 'finalizarJornada':
                return {
                    apiCall: this.checadorService.finalizarJornada(empleado.id, foto, unidadId),
                    successMessage: '¡Jornada finalizada con éxito!'
                };
            case 'iniciarPausa':
                if (!pausa) return { apiCall: null, successMessage: '' };
                return {
                    apiCall: this.checadorService.iniciarPausa(empleado.id, pausa, foto, unidadId),
                    successMessage: `¡Pausa de ${pausa} iniciada!`
                };
            case 'finalizarPausa':
                if (!pausa) return { apiCall: null, successMessage: '' };
                return {
                    apiCall: this.checadorService.finalizarPausa(empleado.id, pausa, foto, unidadId),
                    successMessage: `¡Pausa de ${pausa} finalizada!`
                };
            default:
                this.errorApiSignal.set('Acción no reconocida.');
                return { apiCall: null, successMessage: '' };
        }
    }

    // ========== MANEJO DE ERRORES MEJORADO ==========
    private obtenerMensajeErrorConsulta(error: any): string {
        // Verificar si es un timeout error
        if (error instanceof TimeoutError) {
            return 'La consulta está tardando más de lo esperado. Verifica tu conexión.';
        }

        // Si es HttpErrorResponse
        if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
                return 'No se puede conectar al servidor. Verifica tu conexión a internet o intente más tarde.';
            }
            if (error.status === 404) {
                return 'Usuario no encontrado. Verifica tu NIP.';
            }
            if (error.status >= 500) {
                return 'Error del servidor. Intenta nuevamente en unos momentos.';
            }

            const errorBody: ApiErrorResponse = error.error;
            return errorBody?.message || 'Error de conexión con el servidor.';
        }

        return 'Error inesperado. Inténtalo de nuevo.';
    }

    private obtenerMensajeErrorProcesamiento(error: any): string {
        // Verificar si es un timeout error
        if (error instanceof TimeoutError) {
            return 'El registro está tardando más de lo esperado. Verifica tu conexión.';
        }

        // Si es HttpErrorResponse
        if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
                return 'No se puede conectar al servidor. Verifica tu conexión.';
            }
            if (error.status >= 500) {
                return 'Error del servidor. Intenta nuevamente.';
            }

            const errorBody: ApiErrorResponse = error.error;
            return errorBody?.message || 'No se pudo registrar la operación. Inténtalo de nuevo.';
        }

        return 'Error inesperado. Inténtalo de nuevo.';
    }

    // ========== MÉTODOS DE UTILIDAD OPTIMIZADOS ==========
    private mostrarMensajeExito(mensaje: string): void {
        this.successMessageTextSignal.set(mensaje);
        this.showSuccessMessageSignal.set(true);

        setTimeout(() => {
            this.showSuccessMessageSignal.set(false);
            this.regresarAlReloj();
        }, 2500);
    }

    private resetearCamara(): void {
        this.fotoCapturadaSignal.set(null);
        this.webcamErrorSignal.set(null);
        this.errorApiSignal.set(null);
    }

    private resetearEstado(): void {
        // Batch updates
        this.empleadoSignal.set(null);
        this.errorApiSignal.set(null);
        this.valorIngresadoSignal.set('');
        this.accionActualSignal.set(null);
        this.pausaActualSignal.set(null);
        this.resetearCamara();
    }

    private limpiarTimers(): void {
        if (this.capturaAutomaticaTimerId) {
            clearTimeout(this.capturaAutomaticaTimerId);
            this.capturaAutomaticaTimerId = undefined;
        }
        this.limpiarCountdownTimer();
    }

    private limpiarCountdownTimer(): void {
        if (this.countdownIntervalId) {
            clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = undefined;
        }
    }

    private limpiarTodosLosTimers(): void {
        this.limpiarTimers();
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }

    private enfocarInputSiEsNecesario(): void {
        if (this.vistaActualSignal() === 'reloj') {
            // Usar requestAnimationFrame para mejor rendimiento
            requestAnimationFrame(() => {
                this.codeInput?.nativeElement.focus();
            });
        }
    }

    // ========== MÉTODOS DE CONFIGURACIÓN CON PERSISTENCIA ==========
    private cargarConfiguracionDesdeStorage(): ConfiguracionSistema {
        try {
            const unidadGuardada = localStorage.getItem('unidad_reloj');
            if (unidadGuardada) {
                const unidad = JSON.parse(unidadGuardada);
                return {
                    unidadId: unidad.id,
                    requiereCamara: unidad.requiereCamara ?? true
                };
            }
        } catch (error) {
            console.warn('Error al cargar configuración desde localStorage:', error);
        }

        // Sin configuración por defecto - se mostrará modal
        return { unidadId: 0, requiereCamara: true };
    }

    private guardarConfiguracionEnStorage(config: ConfiguracionSistema): void {
        try {
            localStorage.setItem('checador-config', JSON.stringify(config));
        } catch (error) {
            console.warn('Error al guardar configuración en localStorage:', error);
        }
    }

    // ========== PROCESAMIENTO SIN CÁMARA ==========
    private procesarSinCamara(): void {
        const empleado = this.empleadoSignal();
        const accion = this.accionActualSignal();

        if (!empleado || !accion) {
            this.errorApiSignal.set('Error: Faltan datos para procesar la solicitud.');
            return;
        }

        this.isUploadingSignal.set(true);
        this.errorApiSignal.set(null);

        const { apiCall, successMessage } = this.obtenerConfiguracionAccionSinCamara();
        if (!apiCall) return;

        apiCall
            .pipe(
                timeout(App.TIMEOUT_MS),
                takeUntil(this.destroy$),
                finalize(() => this.isUploadingSignal.set(false)),
                catchError((error: HttpErrorResponse) => {
                    console.error('Error en procesamiento:', error);
                    this.errorApiSignal.set(this.obtenerMensajeErrorProcesamiento(error));
                    return of(null);
                })
            )
            .subscribe((response) => {
                if (response?.success) {
                    this.mostrarMensajeExito(successMessage);
                }
            });
    }

    // Configuración de acciones sin cámara
    private obtenerConfiguracionAccionSinCamara(): { apiCall: Observable<any> | null; successMessage: string } {
        const empleado = this.empleadoSignal()!;
        const accion = this.accionActualSignal()!;
        const pausa = this.pausaActualSignal();
        const unidadId = this.configuracionSignal().unidadId;

        switch (accion) {
            case 'iniciarJornada':
                return {
                    apiCall: this.checadorService.iniciarJornada(empleado.id, null, unidadId),
                    successMessage: '¡Jornada iniciada con éxito!'
                };
            case 'finalizarJornada':
                return {
                    apiCall: this.checadorService.finalizarJornada(empleado.id, null, unidadId),
                    successMessage: '¡Jornada finalizada con éxito!'
                };
            case 'iniciarPausa':
                if (!pausa) return { apiCall: null, successMessage: '' };
                return {
                    apiCall: this.checadorService.iniciarPausa(empleado.id, pausa, null, unidadId),
                    successMessage: `¡Pausa de ${pausa} iniciada!`
                };
            case 'finalizarPausa':
                if (!pausa) return { apiCall: null, successMessage: '' };
                return {
                    apiCall: this.checadorService.finalizarPausa(empleado.id, pausa, null, unidadId),
                    successMessage: `¡Pausa de ${pausa} finalizada!`
                };
            default:
                this.errorApiSignal.set('Acción no reconocida.');
                return { apiCall: null, successMessage: '' };
        }
    }

    // ========== GESTIÓN DE UNIDADES ==========
    private async verificarUnidadConfiguracion(): Promise<void> {
        const config = this.configuracionSignal();
        if (config.unidadId === 0) {
            // No hay unidad configurada, mostrar modal
            await this.cargarUnidades();
            this.mostrarModalUnidadSignal.set(true);
        } else {
            // Sincronizar configuración existente
            this.sincronizarConfiguracionSilenciosa();
        }
    }

    private sincronizarConfiguracionSilenciosa(): void {
        const unidadId = this.configuracionSignal().unidadId;
        if (!unidadId) return;

        this.kioscoConfig
            .obtenerUnidadKiosco(unidadId)
            .pipe(
                timeout(5000),
                takeUntil(this.destroy$),
                catchError(() => of(null))
            )
            .subscribe((response) => {
                if (response?.success && response.data) {
                    const unidadLocal = JSON.parse(localStorage.getItem('unidad_reloj') || '{}');

                    // Solo actualizar si la versión cambió
                    if (unidadLocal.versionKiosco !== response.data.versionKiosco) {
                        const nuevaConfig: ConfiguracionSistema = {
                            unidadId: response.data.id,
                            requiereCamara: response.data.requiereCamara ?? true
                        };
                        this.configuracionSignal.set(nuevaConfig);
                        localStorage.setItem('unidad_reloj', JSON.stringify(response.data));
                    }
                }
            });
    }

    private async cargarUnidades(): Promise<void> {
        this.isLoadingUnidadesSignal.set(true);

        this.kioscoConfig
            .obtenerUnidadesKiosco()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isLoadingUnidadesSignal.set(false))
            )
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.unidadesSignal.set(response.data || []);
                    } else {
                        this.errorApiSignal.set('Error al cargar unidades');
                    }
                },
                error: (error) => {
                    console.error('Error al cargar unidades:', error);
                    this.errorApiSignal.set('Error al cargar unidades');
                }
            });
    }
}
