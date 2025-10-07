import { AppConfig } from '@/config/base.config';

export class Page {
    private _first: number; // Índice del primer elemento

    get first(): number {
        return this._first;
    }

    private _totalRecords: number; // Total de registros

    get totalRecords(): number {
        return this._totalRecords;
    }

    private _rows: number; // Número de filas por página

    get rows(): number {
        return this._rows;
    }

    private _loading: boolean; // Estado de carga

    get loading(): boolean {
        return this._loading;
    }

    set loading(value: boolean) {
        this._loading = value;
    }

    reset() {
        this._rows = AppConfig.MAX_ROW_TABLE;
        this._totalRecords = 0;
        this.loading = true;
        this._first = 0;
    }

    change(loading: boolean, totalRecords: number) {
        this._loading = loading;
        this._totalRecords = totalRecords;
    }

    changePage(first: number, rows: number) {
        this._first = first;
        this._rows = rows;
    }
}
