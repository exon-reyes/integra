import { inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from 'primeng/api';

export class AbstractService {
    protected header: HttpHeaders;
    protected http: HttpClient;
    protected messageService = inject(MessageService);

    constructor() {
        this.http = inject(HttpClient);
        this.header = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
}
