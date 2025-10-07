import {Component, inject, Input} from '@angular/core';
import {Button} from 'primeng/button';
import {MessageService} from 'primeng/api';
import { ClipboardService } from '@/shared/service/clipboard.service';

@Component({
  selector: 'button-copy',
  imports: [
    Button
  ],
  templateUrl: './copy.component.html',
  styleUrl: './copy.component.scss'
})
export class CopyComponent {
  @Input() data!: string;
  @Input() severity: "success" | "info" | "warn" | "danger" | "help" | "primary" | "secondary" | "contrast" = "secondary";
  private notify = inject(MessageService);
  private clipBoardService = inject(ClipboardService);

  copyElement() {
    if (this.data) {
      this.clipBoardService.copy(this.data).then(() =>
        this.notify.add({
          life: 6000,
          summary: 'Copiado',
          detail: 'Datos copiados al portapapeles',
          severity: 'info'
        })
      );
    }
  }
}
