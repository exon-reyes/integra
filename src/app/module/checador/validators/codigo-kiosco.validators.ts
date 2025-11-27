import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CodigoKioscoValidators {
    static nipValido(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) return null;

            const isNumeric = /^\d+$/.test(value);
            const validLength = value.length >= 4 && value.length <= 8;

            return isNumeric && validLength ? null : { nipInvalido: true };
        };
    }

    static codigoCincoDigitos(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) return null;

            const isValid = /^\d{5}$/.test(value);
            return isValid ? null : { codigoInvalido: true };
        };
    }
}
