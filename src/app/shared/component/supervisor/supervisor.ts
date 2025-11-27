import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Select } from 'primeng/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmpleadoService } from '@/core/services/organizacion/empleado.service';
import { InfoBasicaEmpleado } from '@/models/organizacion/empleado';

@Component({
    selector: 'app-supervisor',
    imports: [Select],
    templateUrl: './supervisor.html',
    styleUrl: './supervisor.scss'
})
export class Supervisor implements OnInit {
    @Output() selectedSupervisor = new EventEmitter<InfoBasicaEmpleado>();
    protected empleados: InfoBasicaEmpleado[] = [];
    private destroyRef = inject(DestroyRef);
    private empleadoService = inject(EmpleadoService);

    ngOnInit(): void {
        this.empleadoService
            .obtenerSupervisores()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.empleados = response.data;
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }
}
