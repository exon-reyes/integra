import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstatusPublicoService {
  private estatusSubject = new BehaviorSubject<boolean>(false); // Estado inicial false
  public estatus$ = this.estatusSubject.asObservable();

  change(newValue: boolean) {
    this.estatusSubject.next(newValue);
  }
}
