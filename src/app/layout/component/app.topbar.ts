import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AppConfig } from '@/config/base.config';
import { ClickOutsideDirective } from '@/layout/directive/ClickOutsideDirective';
import { JWTService, UserPrincipal } from '@/core/security/JWTService';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ClickOutsideDirective, NgOptimizedImage],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img ngSrc="assets/icon/sci.svg" priority width="32" height="32" alt="icon" />
                <span>{{ APP_NAME }}</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <div class="relative ml-3" (clickOutside)="isOpen = false">
                <button (click)="toggleMenu()" class="layout-topbar-action flex items-center gap-2">
                    <i class="pi pi-user"></i>
                </button>

                <ng-container *ngIf="isOpen">
                    <div class="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white py-2 shadow-xl ring-1 ring-black/10 border border-gray-100">
                        <!-- Usuario -->
                        <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <i class="pi pi-user text-white text-sm"></i>
                            </div>
                            <div class="flex flex-col overflow-hidden">
                                <span class="truncate max-w-[140px] font-semibold text-gray-900">{{ username }}</span>
                                <span class="truncate max-w-[140px] text-sm text-gray-600">{{ name }}</span>
                            </div>
                        </div>

                        <!-- Opciones -->
                        <div class="py-1">
                            <a class="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer">
                                <i class="pi pi-cog text-gray-500"></i>
                                <span>Mi cuenta</span>
                            </a>
                            <a (click)="logout()" class="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                <i class="pi pi-sign-out"></i>
                                <span>Cerrar sesión</span>
                            </a>
                        </div>
                    </div>
                </ng-container>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    APP_NAME = AppConfig.APP_NAME;
    isOpen = false;
    protected username: string = '';
    protected name: string = '';

    constructor(
        public layoutService: LayoutService,
        private jwtService: JWTService,
        private router: Router
    ) {
        this.setUser();
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.jwtService.clearToken();
        this.router.navigate(['/']);
    }

    private setUser() {
        const user: UserPrincipal | null = this.jwtService.getUser();
        if (user) {
            this.username = user.username;
            this.name = user.name;
        }
    }
}
