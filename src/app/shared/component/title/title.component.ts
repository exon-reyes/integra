import {Component, Input} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-title',
    imports: [NgOptimizedImage],
    templateUrl: './title.component.html',
    standalone: true,
    styleUrl: './title.component.scss'
})
export class TitleComponent {
    @Input('enable-icon') habilitarIcono: boolean;
    @Input() imageSrc: string;
    @Input() title: string = '';
    @Input() description: string = '';
}
