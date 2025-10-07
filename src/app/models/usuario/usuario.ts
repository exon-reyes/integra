export interface Permiso {
    id: number;
    nombre: string;
}

export interface Rol {
    id: number;
    nombre: string;
    permisos: Permiso[];
}

export interface Usuario {
    id: number;
    nombre: string;
    nombreCompleto: string;
    rol: Rol;
}
