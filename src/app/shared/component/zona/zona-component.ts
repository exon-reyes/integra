import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Select } from 'primeng/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ZonaService } from '@/core/services/ubicacion/zona.service';
import {Zona} from "@/models/ubicacion/zona";

@Component({
    selector: 'app-zona',
    imports: [Select],
    templateUrl: './zona-component.html',
    styleUrl: './zona-component.scss'
})
export class ZonaComponent implements OnInit {
    @Output() selectedZona = new EventEmitter<Zona>();
    protected zonas: Zona[] = [];
    private destroyRef = inject(DestroyRef);
    private empleadoService = inject(ZonaService);

    ngOnInit(): void {
        this.empleadoService
            .obtenerZonas()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.zonas = response.data;
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }
}
