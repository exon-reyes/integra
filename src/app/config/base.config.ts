// Parametros generales para su integración en modulos
export const AppConfig = {
    MAX_ROW_TABLE: 30,
    ID_PUESTO_SUPERVISOR: 4,
    ESTATUS_EMPLEADO_ACTIVO: 'A',
    IDS_ESTATUS_EXTERNO: [1, 2],
    APP_NAME: 'Integra'
};
export const APP_INFO = {
    version: 'v1.0.1-Beta',
    devDescription: `
Nos encontramos en fase beta, implementando mejoras progresivas para optimizar la organización, el seguimiento diario y el flujo de procesos del sistema.
<br><br>
Puedes usar las funcionalidades disponibles según tu perfil.
    `
};
export const MODULE_KEYS = {
    DEPARTAMENTO_SCI: 12,
    ID_DEPARTAMENTO_FIXCONTROL: 12
};
// Identificador de estatus referenciado a Seguimientos e incidencias en áreas de interés
export enum Estatus {
    Abierto,
    Cerrado,
    Resuelto,
    Pendiente,
    Cancelado
}
