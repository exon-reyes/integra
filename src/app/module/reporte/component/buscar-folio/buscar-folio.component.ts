import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';

@Component({
    selector: 'buscar-folio',
    imports: [Dialog, ReactiveFormsModule, InputText, Button],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './buscar-folio.component.html',
    styleUrl: './buscar-folio.component.scss'
})
export class BuscarFolioComponent {
    @Input() visible = false;
    @Output() cerrar = new EventEmitter<void>();
    @Output() buscarFolio = new EventEmitter<string>();

    protected form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.initForm();
    }

    cerrarModal(): void {
        this.visible = false;
        this.form.reset();
        this.cerrar.emit();
    }

    buscar(): void {
        if (this.form.valid) {
            const folio = this.form.get('folio')?.value?.trim();
            if (folio) {
                this.buscarFolio.emit(folio);
                this.cerrarModal();
            }
        }
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            folio: ['', [Validators.required, Validators.minLength(1)]]
        });
    }
}