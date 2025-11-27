import { Autoridades } from '@/config/Autoridades';

export interface Permiso {
    id: string;
    nombre: string;
    asignado: boolean;
    desdeRol?: boolean;
}

export interface Submodulo {
    id: string;
    nombre: string;
    asignado?: boolean;
    permisos: Permiso[];
}

export interface Modulo {
    id: string;
    nombre: string;
    permisoAcceso: string;
    asignado: boolean;
    submodulos: Submodulo[];
}

export const modulosBase: Modulo[] = [
    {
        id: Autoridades.VER_MODULO_GENERALES,
        nombre: 'Generales',
        permisoAcceso: Autoridades.VER_MODULO_GENERALES,
        asignado: false,
        submodulos: [
            {
                id: Autoridades.VER_SUBMODULO_UNIDADES,
                nombre: 'Unidades',
                permisos: [
                    { id: Autoridades.CONSULTAR_UNIDADES, nombre: 'Consultar unidades', asignado: false },
                    { id: Autoridades.EDITAR_UNIDAD, nombre: 'Editar información general de la unidad', asignado: false },
                    { id: Autoridades.ELIMINAR_UNIDAD, nombre: 'Eliminar unidad', asignado: false },
                    { id: Autoridades.CREAR_UNIDAD, nombre: 'Permite crear una nueva unidad', asignado: false },
                    { id: Autoridades.EXPORTAR_UNIDAD, nombre: 'Permite exportar la información de contacto', asignado: false }
                ]
            },
            {
                id: Autoridades.VER_SUBMODULO_ZONAS,
                nombre: 'Zonas',
                permisos: [
                    { id: Autoridades.CREAR_ZONA, nombre: 'Permite agregar una nueva zona', asignado: false },
                    { id: Autoridades.EDITAR_ZONA, nombre: 'Permite editar la información de la zona', asignado: false },
                    { id: Autoridades.ELIMINAR_ZONA, nombre: 'Permite eliminar la zona', asignado: false }
                ]
            }
        ]
    },
    {
        id: Autoridades.VER_MODULO_RRHH,
        nombre: 'Gestión RRHH',
        permisoAcceso: Autoridades.VER_MODULO_RRHH,
        asignado: false,
        submodulos: [
            {
                id: Autoridades.VER_SUBMODULO_EMPLEADOS,
                nombre: 'Empleados',
                permisos: [
                    { id: Autoridades.CONSULTAR_INFORME_EMPLEADOS, nombre: 'Consultar informe de asistencia de empleados', asignado: false },
                    { id: Autoridades.VER_INDICADORES_EMPLEADOS, nombre: 'Visualizar indicadores de empleados activos, inactivos, reingresos', asignado: false },
                    { id: Autoridades.EXPORTAR_EMPLEADOS, nombre: 'Permitir exportar empleados', asignado: false },
                    { id: Autoridades.RESTRINGIR_CONSULTA_SUPERVISOR_EMPL, nombre: 'Restringe filtros de consulta a puesto de supervisores', asignado: false }
                ]
            },
            {
                id: Autoridades.VER_SUBMODULO_INFORME_ASISTENCIA,
                nombre: 'Informe de asistencia',
                permisos: [
                    { id: Autoridades.CONSULTAR_INFORME_ASISTENCIA, nombre: 'Consultar informe de asistencia de empleados', asignado: false },
                    { id: Autoridades.RESTRINGIR_CONSULTA_SUPERVISOR_ASIST, nombre: 'Restringe filtros de consulta a puesto de supervisores', asignado: false },
                    { id: Autoridades.EXPORTAR_ASISTENCIA, nombre: 'Exportar lista de asistencia', asignado: false }
                ]
            },
            {
                id: Autoridades.VER_SUBMODULO_CONFIG_OPENTIME,
                nombre: 'Gestión reloj checador',
                permisos: [
                    { id: Autoridades.CONSULTAR_CONFIGURACION, nombre: 'Visualizar parametros de configuración para las unidades', asignado: false },
                    { id: Autoridades.ACTIVAR_DESACTIVAR_CAMARA, nombre: 'Puede activar o desactivar el uso de camara web', asignado: false },
                    { id: Autoridades.MODIFICAR_TIEMPOS_COMP, nombre: 'Puede modificar tiempos de compensación a las unidades', asignado: false },
                    { id: Autoridades.APROBAR_CONFIG_PERSONALIZADA, nombre: 'Puede aprobar solicitudes de configuración personalizada', asignado: false },
                    { id: Autoridades.VER_INDICADORES_USO, nombre: 'Puede visualizar indicadores generales de uso', asignado: false }
                ]
            },
            {
                id: Autoridades.VER_SUBMODULO_COMPENSACIONES,
                nombre: 'Compensaciones',
                permisos: [
                    { id: Autoridades.VER_COMPENSACIONES_APLICADAS, nombre: 'Visualizar compensaciones aplicadas a empleados', asignado: false },
                    { id: Autoridades.RESTRINGIR_CONSULTA_SUPERVISOR_COMP, nombre: 'Restringe filtros de consulta a puesto de supervisores', asignado: false },
                    { id: Autoridades.EXPORTAR_COMPENSACIONES, nombre: 'Exportar lista de compensaciones aplicadas', asignado: false },
                    { id: Autoridades.ACCESO_RELOJ_CHECADOR, nombre: 'Acceso directo al módulo checador', asignado: false }
                ]
            }
        ]
    },
    {
        id: Autoridades.VER_MODULO_INFRAESTRUCTURA,
        nombre: 'Infraestructura TI',
        permisoAcceso: Autoridades.VER_MODULO_INFRAESTRUCTURA,
        asignado: false,
        submodulos: [
            {
                id: Autoridades.VER_SUBMODULO_ROLES,
                nombre: 'Gestión de roles',
                permisos: [
                    { id: Autoridades.VER_ROLES_PERMISOS, nombre: 'Visualiza los roles y los permisos asociados', asignado: false },
                    { id: Autoridades.ELIMINAR_ROL, nombre: 'Eliminar roles creados por el usuario', asignado: false },
                    { id: Autoridades.EDITAR_ROL, nombre: 'Puede editar roles y sus permisos asociados', asignado: false },
                    { id: Autoridades.CREAR_ROL, nombre: 'Crear nuevos roles', asignado: false }
                ]
            },
            {
                id: Autoridades.VER_SUBMODULO_USUARIOS,
                nombre: 'Gestión de usuarios',
                permisos: [
                    { id: Autoridades.CONSULTAR_USUARIOS, nombre: 'Consultar usuarios', asignado: false },
                    { id: Autoridades.CREAR_USUARIO, nombre: 'Permite crear un nuevo usuario', asignado: false },
                    { id: Autoridades.EDITAR_USUARIO, nombre: 'Editar información de roles y permisos de usuario', asignado: false },
                    { id: Autoridades.DESACTIVAR_USUARIO, nombre: 'Permite desactivar un usuario', asignado: false }
                ]
            },
            {
                id: Autoridades.VER_SUBMODULO_CREDENCIALES,
                nombre: 'Gestión de credenciales',
                permisos: [
                    { id: Autoridades.CONSULTAR_CREDENCIALES, nombre: 'Permite visualizar las credenciales de acceso', asignado: false },
                    { id: Autoridades.EDITAR_CREDENCIALES, nombre: 'Permite editar las credenciales de acceso', asignado: false },
                    { id: Autoridades.ELIMINAR_CREDENCIALES, nombre: 'Permite eliminar credenciales de acceso', asignado: false },
                    { id: Autoridades.EXPORTAR_CREDENCIALES, nombre: 'Exportar credenciales', asignado: false },
                    { id: Autoridades.CREAR_CREDENCIAL, nombre: 'Crear credenciales de acceso', asignado: false },
                    { id: Autoridades.CREAR_PROVEEDOR, nombre: 'Crear un nuevo proveedor de cuenta de acceso', asignado: false },
                    { id: Autoridades.CONSULTAR_PROVEEDORES, nombre: 'Consultar proveedores de acceso', asignado: false },
                    { id: Autoridades.EDITAR_PROVEEDOR, nombre: 'Editar información del proveedor de acceso', asignado: false },
                    { id: Autoridades.ELIMINAR_PROVEEDOR, nombre: 'Eliminar proveedores de acceso', asignado: false }
                ]
            }
        ]
    }
];
