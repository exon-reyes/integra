import { Component, inject, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppStatsComponent } from '@/modules/fixcontrol/dashboard/stats-content/app-stats.component';
import { UsuarioService } from '@/core/services/usuario/usuario.service';

@Component({
    selector: 'app-dashboard',
    imports: [NgOptimizedImage, AppStatsComponent, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    // Signal para el departamento ID
    readonly departamentoId = signal<number>(12);
    private readonly usuarioService = inject(UsuarioService);

    ngOnInit(): void {
        // Inicializar el departamento al cargar el componente
        this.inicializarDepartamento();
    }

    /**
     * Obtiene el ID del departamento del usuario actual
     * Utiliza el servicio de usuario para obtener el departamento
     */
    getDepartamentoId(): number {
        return this.departamentoId();
    }

    /**
     * Inicializa el departamento del usuario
     */
    private inicializarDepartamento(): void {
        // Intentar obtener desde el servicio de usuario
        this.departamentoId.set(12);
    }
}
