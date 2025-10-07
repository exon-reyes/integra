import {Component, EventEmitter, Output} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-nuevo-proveedor',
  imports: [InputText, Button],
  templateUrl: './nuevo-proveedor.component.html',
  styleUrl: './nuevo-proveedor.component.scss'
})
export class NuevoProveedorComponent {
  @Output('cerrar') success = new EventEmitter<boolean>();
}
