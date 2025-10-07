import {Component, DestroyRef, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Select} from "primeng/select";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Estatus } from '@/models/reporte/estatus';
import { EstatusService } from '@/core/services/reporte/estatus.service';


@Component({
  selector: 'app-status-seguimiento',
  imports: [FormsModule, ReactiveFormsModule, Select],
  templateUrl: './status-seguimiento.component.html',
})
export class StatusSeguimientoComponent implements OnInit {
  @Output() selectedStatus = new EventEmitter<Estatus>();
  protected options: Estatus[] = []
  private statusService = inject(EstatusService)
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.statusService.obtenerEstatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({next: response => this.options = response.data})
  }
}
