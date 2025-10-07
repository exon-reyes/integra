import {Component, DestroyRef, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {Select} from 'primeng/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { UnidadService } from '@/core/services/empresa/unidad.service';
import { Unidad } from '@/models/empresa/unidad';

@Component({
  selector: 'app-unidad',
  imports: [Select, FormsModule, ReactiveFormsModule],
  templateUrl: './unidad.component.html',
  styleUrl: './unidad.component.scss'
})
export class UnidadComponent implements OnInit {
  @Output() selectedUnit = new EventEmitter<Unidad>();
  protected units: Unidad[] = []
  private destroyRef = inject(DestroyRef);
  private unitService = inject(UnidadService)

  ngOnInit(): void {
    this.unitService.obtenerUnidades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.units = response.data
        }, error: (e) => {
          console.error(e)
        }
      })
  }
}
