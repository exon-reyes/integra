import {Observable, of} from 'rxjs';
import {inject} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
export class AbstractService {
  protected header: HttpHeaders;
  protected http: HttpClient;

  constructor() {
    this.http = inject(HttpClient);
    this.header = new HttpHeaders({'Content-Type': 'application/json'});
  }

  protected handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
