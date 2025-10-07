import { Injectable } from '@angular/core';
import { PageFilter } from '@/shared/util/page.filter';

export type FiltroPersonalizadoKey = 'APLICAR_FILTROS' | 'LIMPIAR_FILTROS';

@Injectable({
  providedIn: 'root'
})
export class FiltroPersonalizadoService extends PageFilter<FiltroPersonalizadoKey> {
}