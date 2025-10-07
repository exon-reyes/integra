export interface Rol {
    id: number;
    nombre: string;
    permisos: Permiso[];
}

export interface Permiso {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface Modulo {
    id: number;
    nombre: string;
    submodulos: Submodulo[];
}

export interface Submodulo {
    id: number;
    nombre: string;
    permisos: Permiso[];
}