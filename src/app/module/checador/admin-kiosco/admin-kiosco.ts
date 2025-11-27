import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KioscoConfigService } from '../service/kiosco-config-service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TitleComponent } from '@/shared/component/title/title.component';
import { MessageService } from 'primeng/api';
import { Unidad } from '@/models/empresa/unidad';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-admin-kiosco',
    imports: [CommonModule, TableModule, ButtonModule, TitleComponent, FormsModule, IconField, InputIcon, InputText, Tooltip],
    templateUrl: './admin-kiosco.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './admin-kiosco.scss'
})
export class AdminKiosco implements OnInit {
    kioscos = signal<Unidad[]>([]);
    loading = signal(false);
    editandoCompensacion = signal<number | null>(null);
    tiempoCompensacionTemp = signal<string>('');
    horasTemp = signal<number>(0);
    minutosTemp = signal<number>(0);
    // Total de kioscos
    totalKioscos = computed(() => this.kioscos().length);
    // Kioscos con cámara
    kioscosConCamara = computed(() => this.kioscos().filter((k) => k.requiereCamara).length);

    // ============================================
    // Computed Signals para Estadísticas
    // ============================================
    // Kioscos sin cámara
    kioscosSinCamara = computed(() => this.kioscos().filter((k) => !k.requiereCamara).length);
    // Porcentaje con cámara
    porcentajeConCamara = computed(() => {
        const total = this.totalKioscos();
        if (total === 0) return 0;
        return Math.round((this.kioscosConCamara() / total) * 100);
    });
    // Kioscos con tiempo de compensación
    kioscosConCompensacion = computed(() => this.kioscos().filter((k) => k.tiempoCompensacion && k.tiempoCompensacion !== '00:00:00').length);
    private kioscoService = inject(KioscoConfigService);
    private readonly messageService = inject(MessageService);

    ngOnInit() {
        this.cargarKioscos();
    }

    cargarKioscos() {
        this.loading.set(true);
        this.kioscoService.obtenerUnidadesKiosco().subscribe({
            next: (data) => {
                this.kioscos.set(data.data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error al cargar kioscos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los kioscos'
                });
                this.loading.set(false);
            }
        });
    }

    actualizarEstatusCamara(kiosco: Unidad) {
        const nuevoValor = !kiosco.requiereCamara;
        this.kioscoService.actualizarUsoCamara(kiosco.id, nuevoValor).subscribe({
            next: (response) => {
                if (response.success) {
                    this.kioscos.update((kioscos) => kioscos.map((k) => (k.id === kiosco.id ? { ...k, requiereCamara: nuevoValor } : k)));
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Cámara ${nuevoValor ? 'activada' : 'desactivada'} correctamente`
                    });
                }
            },
            error: (error) => {
                console.error('Error al actualizar requiereCamara:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar la configuración'
                });
            }
        });
    }

    generarCodigoConfig(kiosco: Unidad) {
        this.kioscoService.generarCodigoConfigUnSoloUso(kiosco.id).subscribe({
            next: (response) => {
                if (response.success) {
                    this.kioscos.update((kioscos) => kioscos.map((k) => (k.id === kiosco.id ? { ...k, requiereReset: false, codigoAutorizacionKiosco: response.data } : k)));
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Reset Aprobado',
                        detail: `Código generado: ${response.data}`
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo aprobar el reset'
                });
            }
        });
    }

    rechazarSolicitudCodigo(kiosco: Unidad) {
        this.kioscoService.cancelarCodigo(kiosco.id).subscribe({
            next: (response) => {
                if (response.success) {
                    this.kioscos.update((kioscos) => kioscos.map((k) => (k.id === kiosco.id ? { ...k, requiereReset: false } : k)));
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Configuración manual rechazada'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo rechazar la solicitud'
                });
            }
        });
    }

    iniciarEdicionCompensacion(kiosco: Unidad) {
        this.editandoCompensacion.set(kiosco.id);
        const tiempo = kiosco.tiempoCompensacion || '00:00';
        const [horas, minutos] = tiempo.split(':').map(Number);
        this.horasTemp.set(horas);
        this.minutosTemp.set(minutos);
        this.tiempoCompensacionTemp.set(tiempo);
    }

    cancelarEdicionCompensacion() {
        this.editandoCompensacion.set(null);
        this.tiempoCompensacionTemp.set('');
        this.horasTemp.set(0);
        this.minutosTemp.set(0);
    }

    guardarCompensacion(kiosco: Unidad) {
        const horas = this.horasTemp().toString().padStart(2, '0');
        const minutos = this.minutosTemp().toString().padStart(2, '0');
        const nuevoTiempo = `${horas}:${minutos}:00`;

        this.kioscoService.actualizarCompensacion(kiosco.id, nuevoTiempo).subscribe({
            next: (response) => {
                if (response.success) {
                    this.kioscos.update((kioscos) => kioscos.map((k) => (k.id === kiosco.id ? { ...k, tiempoCompensacion: nuevoTiempo } : k)));
                    this.editandoCompensacion.set(null);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tiempo de compensación actualizado'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar el tiempo de compensación'
                });
            }
        });
    }
}
