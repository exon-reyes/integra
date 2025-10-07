import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-access',
    standalone: true,
    imports: [ButtonModule, RouterModule, RippleModule, ButtonModule],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-4 px-4 sm:px-8 flex flex-col items-center" style="border-radius: 53px">
                        <div class="gap-2 flex flex-col items-center">
                            <div class="flex justify-center items-center border-2 border-orange-500 rounded-full" style="width: 3rem; height: 3rem">
                                <i class="text-orange-500 pi pi-fw pi-lock text-2xl"></i>
                            </div>
                            <h1 class="text-surface-900 dark:text-surface-0 font-bold text-xl lg:text-2xl mb-0">Acceso Denegado</h1>
                            <span class="text-muted-color mb-2 text-center">No cuentas con los permisos necesario para continuar, contacte al administrador</span>
                            <img src="https://primefaces.org/cdn/templates/sakai/auth/asset-access.svg" alt="Access denied" class="mb-2" width="40%" />
                            <div class="col-span-12 mt-2 text-center">
                                <p-button label="Ir al Dashboard" routerLink="/" severity="warn" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})
export class Access {}
