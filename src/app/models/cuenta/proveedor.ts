import { Cuenta } from '@/models/cuenta/cuenta';

export interface Proveedor {
    id?: number;
    nombre?: string;
    icon?: string;
    credenciales?: Cuenta[];
}
