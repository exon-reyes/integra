import { Component, OnInit, signal } from '@angular/core';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { Rol, Usuario } from '@/models/usuario/usuario';
import { UsuarioService } from '@/core/services/usuario/usuario.service';
import { Tag } from 'primeng/tag';
import { TitleComponent } from '@/shared/component/title/title.component';

@Component({
    selector: 'app-usuarios',
    imports: [Panel, TableModule, Tag, TitleComponent],
    templateUrl: './usuarios.html',
    styleUrl: './usuarios.scss'
})
export class Usuarios implements OnInit {
    usuarios = signal<Usuario[]>([]);
    loading = signal(true);

    moduloSeleccionado = signal<string>('TICKET');
    rolSeleccionado = signal<Rol | null>(null);
    rolesDisponibles = signal<Rol[]>([]);

    constructor(private usuarioService: UsuarioService) {}

    ngOnInit() {
        this.cargarUsuarios();
    }

    private cargarUsuarios() {
        this.usuarioService.obtenerUsuarios().subscribe({
            next: (response) => {
                this.usuarios.set(response.data);
                this.extraerRoles(response.data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    private extraerRoles(usuarios: Usuario[]) {
        const rolesUnicos = new Map<number, Rol>();
        usuarios.forEach((usuario) => {
            // usuario.rol.forEach((rol) => {
            //     rolesUnicos.set(rol.id, rol);
            // });
        });
        this.rolesDisponibles.set(Array.from(rolesUnicos.values()));
    }
}
