import { Component, inject, Input, OnInit } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { NgOptimizedImage } from '@angular/common';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { Unidad } from '@/models/empresa/unidad';

@Component({
    selector: 'app-contacto',
    standalone: true,
    imports: [PanelModule, SpinnerComponent, NgOptimizedImage],
    templateUrl: './contacto.component.html',
    styleUrl: './contacto.component.scss'
})
export class ContactoComponent implements OnInit {
    loading: boolean = true;
    @Input('id-unidad') idUnidad!: number;
    protected unidad: Unidad;
    private subscription: Subscription;
    private destroy$ = new Subject<void>();
    private unidadService = inject(UnidadService);

    ngOnInit(): void {
        this.subscription = this.unidadService
            .obtenerContacto(this.idUnidad)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (value) => {
                    this.unidad = value.data; // Asigna los datos de contacto de la unidad.
                    this.loading = false;
                },
                error: () => (this.loading = false)
            });
    }
}
