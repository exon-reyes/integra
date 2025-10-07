import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '@/core/services/auth/AuthService';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() hasPermission: string | string[] = '';
  @Input() hasPermissionOperator: 'AND' | 'OR' = 'OR';

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (this.checkPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission(): boolean {
    if (!this.hasPermission) return true;

    const permissions = Array.isArray(this.hasPermission) ? this.hasPermission : [this.hasPermission];
    
    if (this.hasPermissionOperator === 'AND') {
      return permissions.every(permission => this.authService.hasAuthority(permission));
    } else {
      return permissions.some(permission => this.authService.hasAuthority(permission));
    }
  }
}