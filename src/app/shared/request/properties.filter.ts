export interface PropertiesFilter {
    unidadId?: number;
    estatusId?: number;
    areaId?: number;
    publicar?: boolean;
    pagina: number;
    departamento?: number;
    supervisorId?: number;
    departamentoGeneraId?: number;
    departamentoResponsableId?: number;
    departamentoColaboradorId?:number;
    idDepartamentoGenera?: number;
    idDepartamentoDestino?: number;
    zonaId?: number;
    filas: number;
    folio?: string;
    desde?: string; // Usamos string para facilitar el formato de fecha en el front-end
    hasta?: string;
}
