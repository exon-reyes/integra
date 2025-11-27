import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Departamento } from '@/models/empresa/departamento';
import { DepartamentoService } from '@/core/services/empresa/departamento.service';

@Component({
    selector: 'app-department',
    imports: [Select, FormsModule, ReactiveFormsModule],
    templateUrl: './department.component.html',
    styleUrl: './department.component.scss'
})
export class DepartmentComponent implements OnInit {
    @Output() selectedDepartment = new EventEmitter<Departamento>();
    protected departments: Departamento[] = [];
    private destroyRef = inject(DestroyRef);
    private departmentService = inject(DepartamentoService);

    ngOnInit(): void {
        this.departmentService
            .obtenerDepartamentos()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.departments = response.data;
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }
}
