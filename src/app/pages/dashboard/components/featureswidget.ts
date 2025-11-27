import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

// En inlineSvg cambiar solo el width y el heigth de svg a proporciones que se ajusten a la caja de icono
export interface Feature {
    iscIcon?: string;
    title: string;
    description: string;
    colorBg: string;
    piIcon?: string;
    srcIconName?: string;
    urlNavigator?: string;
    inlineSvg?: SafeHtml;
}

export interface FeatureSection {
    title: string;
    features?: Feature[];
}

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, RouterLink, NgOptimizedImage],
    templateUrl: './features-widget.html'
})
export class FeaturesWidget {
    @Input() featuresData: FeatureSection[] = [];
}
