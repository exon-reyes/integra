import { Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-stats',
    imports: [NgOptimizedImage],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent {
    @Input() title: String;
    @Input() value: any;
    @Input() icon_path: string;
}
