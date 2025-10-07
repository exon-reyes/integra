import {Component, Input} from '@angular/core';
import {NgClass, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-content-component',
  standalone: true,
  imports: [NgClass, NgOptimizedImage],
  template: `
    <div class="flex flex-col items-center">
      <img [ngSrc]="icon" alt="icon" height="40" width="40"/>
      <div [ngClass]="title?.color" class="text-xl font-semibold">{{ title.text }}</div>
      <span class="text-muted-color text-lg font-medium">{{ description }}</span>
      <ng-content></ng-content>
    </div>
  `,
  styles: ``
})
export class ContentComponent {
  @Input('icon-src') icon: string;
  @Input() title: { text: string; color?: string };
  @Input() description?: string;
}
