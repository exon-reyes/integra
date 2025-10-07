import { Component, inject, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Area } from '@/models/area/area';
import { NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { AreaService } from '@/core/services/empresa/area.service';

@Component({
    selector: 'app-areas',
    imports: [TableModule, NgClass, Button],
    templateUrl: './areas.html',
    styleUrl: './areas.scss'
})
export class Areas implements OnInit {
    areas: Area[] = [];
    @Input() departamentoId: number =0 ;
    private areaService = inject(AreaService);

    ngOnInit(): void {
        this.recargarAreas();
        this.areaService.obtenerAreas(this.departamentoId).subscribe({
            next: (response) => {
                this.areas = response.data;
            }
        });
    }

    recargarAreas() {
    }

    loading() {
        return undefined;
    }

    abrirModalAgregar() {
    }

    abrirModalEditar(area: any) {

    }

    eliminarArea(area: any) {

    }
}
