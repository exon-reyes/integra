import {Injectable} from '@angular/core';
import { PageFilter } from '@/shared/util/page.filter';


export type FiltroKey = 'BUSCAR_FOLIO' | 'BUSCAR_POR_FILTRO' | 'REMOVE_FILTER';

@Injectable({
  providedIn: 'root'
})
export class FiltroTicketService extends PageFilter<FiltroKey> {


}
