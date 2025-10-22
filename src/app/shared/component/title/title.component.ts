import { Component, Input, booleanAttribute, computed, signal } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";

@Component({
    selector: 'app-title',
    imports: [NgOptimizedImage],
    templateUrl: './title.component.html',
    standalone: true,
    styleUrl: './title.component.scss'
})
export class TitleComponent {
    @Input({ alias: 'enable-icon', transform: booleanAttribute })
    habilitarIcono: boolean = true;

    @Input() imageSrc: string = '';
    @Input() iconClass: string = '';
    @Input() title: string = '';
    @Input() description: string = '';
    @Input({ transform: booleanAttribute }) priority: boolean = false;

    /**
     * Determina si tiene imagen válida
     */
    get hasValidImage(): boolean {
        return !!this.imageSrc && !this.imageSrc.includes('undefined');
    }

    /**
     * Determina si tiene clase de icono válida
     */
    get hasValidIconClass(): boolean {
        return !!this.iconClass;
    }

    /**
     * Obtiene la primera letra del título en mayúscula
     */
    get titleInitial(): string {
        return this.title?.charAt(0)?.toUpperCase() || '';
    }

    /**
     * Determina si debe mostrar el fallback
     */
    get shouldShowFallback(): boolean {
        return this.habilitarIcono && !this.hasValidImage && !this.hasValidIconClass && !!this.titleInitial;
    }
}
