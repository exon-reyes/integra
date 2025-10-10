// src/app/validators/codigo-kiosco.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { KioscoConfigService } from '@/module/checador/service/kiosco-config-service';

export class CodigoKioscoValidators {
    /**
     * Validador síncrono: Verifica que el código tenga exactamente 5 dígitos
     */
    static codigoCincoDigitos(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            if (!value) return null; // Permitir vacío (combinar con Validators.required)

            const esNumerico = /^\d+$/.test(value);
            const longitudCorrecta = value.length === 5;

            if (!esNumerico) {
                return { soloNumeros: { mensaje: 'Solo se permiten números' } };
            }

            if (!longitudCorrecta) {
                return {
                    longitudIncorrecta: {
                        actual: value.length,
                        requerida: 5,
                        mensaje: `Debe tener 5 dígitos (tienes ${value.length})`
                    }
                };
            }

            return null;
        };
    }

    /**
     * Validador síncrono: Verifica que el NIP esté entre 4-8 dígitos
     */
    static nipValido(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            if (!value) return null;

            const esNumerico = /^\d+$/.test(value);
            const longitudValida = value.length >= 4 && value.length <= 8;

            if (!esNumerico) {
                return { soloNumeros: { mensaje: 'Solo se permiten números' } };
            }

            if (!longitudValida) {
                return {
                    longitudInvalida: {
                        min: 4,
                        max: 8,
                        actual: value.length,
                        mensaje: `El NIP debe tener entre 4 y 8 dígitos`
                    }
                };
            }

            return null;
        };
    }

    /**
     * Validador asíncrono: Verifica el código en el servidor (debounce automático)
     * Uso: this.fb.control('', [], [CodigoKioscoValidators.verificarCodigoAsync(unidadId)])
     */
    static verificarCodigoAsync(kioscoService: KioscoConfigService, unidadId: number): ValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value || control.value.length !== 5) {
                return of(null);
            }

            // Debounce de 500ms antes de consultar servidor
            return timer(500).pipe(
                switchMap(() =>
                    kioscoService.usarCodigoConfiguracion(unidadId, control.value).pipe(
                        map((response) => {
                            if (response.success) {
                                return null;
                            }
                            return {
                                codigoInvalido: {
                                    mensaje: 'Código incorrecto o expirado'
                                }
                            };
                        })
                    )
                )
            );
        };
    }
}
