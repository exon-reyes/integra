import {Component, inject, Input, OnInit} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import { HorarioOperativo } from '@/models/empresa/horario-operativo';
import { SpinnerComponent } from '@/shared/component/spinner.component';
import { Panel } from 'primeng/panel';
import { UnidadService } from '@/core/services/empresa/unidad.service';

@Component({
  selector: 'app-operatividad',
  imports: [
    SpinnerComponent,
    Panel
  ],
  templateUrl: './operatividad.component.html',
  styleUrl: './operatividad.component.scss'
})
export class OperatividadComponent implements OnInit {
  @Input('id-unidad') idUnidad: number;
  protected loading: boolean = true;
  protected horarios!: HorarioOperativo[]
  private subscription: Subscription;
  private destroy$ = new Subject<void>();
  private unidadService = inject(UnidadService);

  ngOnInit(): void {
    this.subscription = this.unidadService.obtenerHorarios(this.idUnidad)
      .pipe()
      .subscribe({
        next: (value) => {
          this.horarios = value.data; // Asigna los datos de contacto de la unidad.
          this.loading = false
        }, error: () => this.loading = false
      });
  }
}
