import { Component, Input } from '@angular/core';
import { ErrorResponseService } from '@/shared/service/error.response.service';

@Component({
    selector: 'app-error',
    imports: [],
    templateUrl: './error.component.html',
    styleUrl: './error.component.scss'
})
export class ErrorComponent {
    @Input() errorService!: ErrorResponseService;

    get dataMessages(): string[] {
        const error = this.errorService.error();
        if (!error || !error.data) {
            return [];
        }

        if (typeof error.data === 'object') {
            return Object.values(error.data);
        }

        return [];
    }
}
