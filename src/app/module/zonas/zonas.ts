import {Component, inject, OnInit, signal} from '@angular/core';
import {TableModule} from "primeng/table";
import {ZonaService} from "@/core/services/ubicacion/zona.service";
import {Zona} from "@/models/ubicacion/zona";
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-zonas',
    imports: [TableModule, Button, InputText, FormsModule], templateUrl: './zonas.html', styleUrl: './zonas.scss'
})
export class Zonas implements OnInit {
    zonas = signal<Zona[]>([]);
    nombreZona = '';
    zonaEditando: Zona | null = null;
    loading = false;
    private zonaService = inject(ZonaService);

    ngOnInit() {
        this.loadZonas();
    }

    loadZonas() {
        this.zonaService.obtenerZonas().subscribe({
            next: (response) => {
                this.zonas.set(response.data);
            }
        });
    }
    editarZona(zona: Zona) {
        this.zonaEditando = zona;
        this.nombreZona = zona.nombre;
    }

    guardarZona() {
        if (!this.nombreZona.trim()) return;

        this.loading = true;
        if (this.zonaEditando) {
            this.zonaService.actualizarZona({ id: this.zonaEditando.id, nombre: this.nombreZona, activo: this.zonaEditando.activo }).subscribe({
                next: () => {
                    this.loadZonas();
                    this.cancelarEdicion();
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error actualizando zona:', err);
                    this.loading = false;
                }
            });
        } else {
            console.log('Guardando zona con nombre:', this.nombreZona);
            this.zonaService.registrarZona({ nombre: this.nombreZona }).subscribe({
                next: () => {
                    this.loadZonas();
                    this.nombreZona = '';
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error registrando zona:', err);
                    this.loading = false;
                }
            });
        }
    }

    cancelarEdicion() {
        this.zonaEditando = null;
        this.nombreZona = '';
    }

    eliminarZona(zona: Zona) {
        if (confirm(`¿Eliminar zona "${zona.nombre}"?`)) {
            this.zonaService.eliminarZona(zona.id).subscribe({
                next: () => this.loadZonas()
            });
        }
    }

    toggleZonaActivo(zona: Zona) {
        console.log('Toggling zona')
        this.zonaService.actualizarZona({ id: zona.id, nombre: zona.nombre, activo: !zona.activo }).subscribe({
            next: () => this.loadZonas(),
            error: (err) => console.error('Error toggling zona activo:', err)
        });
    }

    get zonasActivas() {
        return this.zonas().filter(z => z.activo).length;
    }

    get zonasInactivas() {
        return this.zonas().filter(z => !z.activo).length;
    }

    get totalZonas() {
        return this.zonas().length;
    }
}
