import { Injectable, signal } from '@angular/core';
import { ErrorData } from '@/shared/util/error.data';

@Injectable()
export class ErrorResponseService {
    private readonly _error = signal<ErrorData | null>(null);
    readonly error = this._error.asReadonly();

    setError(error: ErrorData) {
        this._error.set(error);
    }

    clear() {
        this._error.set(null);
    }
}
