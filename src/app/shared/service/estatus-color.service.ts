import { Injectable } from '@angular/core';
import { Estatus } from '@/config/base.config';

@Injectable({
    providedIn: 'root'
})
export class EstatusColorService {
    private classMap: Record<Estatus, string> = {
        [Estatus.Abierto]: 'bg-green-500',
        [Estatus.Cerrado]: 'bg-blue-500',
        [Estatus.Resuelto]: 'bg-purple-500',
        [Estatus.Pendiente]: 'bg-orange-500',
        [Estatus.Cancelado]: 'bg-red-500'
    };

    getClass(status: Estatus): string {
        return this.classMap[status] || this.classMap[Estatus.Pendiente]; // Clase por defecto
    }
}
