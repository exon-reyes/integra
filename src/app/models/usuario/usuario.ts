import { Rol } from '@/module/rol-admin/service/rol.service';

export interface Usuario {
    id?: number;
    nombre?: string;
    email?: string;
    activo?: boolean;
    createAt?: Date;
    roles?: Rol[];
    permisos?: Array<string>;
}
