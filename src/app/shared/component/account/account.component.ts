import {Component, Input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-cuenta', imports: [
    NgOptimizedImage
  ], templateUrl: './account.component.html', styleUrl: './account.component.scss'
})
export class AccountComponent {
  @Input('icon-src') icon_src: string
  @Input() title: string
  @Input() subtitle: string
}
