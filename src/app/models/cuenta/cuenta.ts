import { Departamento } from '@/models/empresa/departamento';
import { Unidad } from '@/models/empresa/unidad';
import { Proveedor } from '@/models/cuenta/proveedor';

export interface Cuenta {
    id: number;
    usuario?: string;
    clave?: string;
    comentario?: string;
    actualizado?: string;
    unidad?: Unidad;
    departamento?: Departamento;
    proveedor?: Proveedor;
}
