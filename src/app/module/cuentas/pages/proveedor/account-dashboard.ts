import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FilterService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { CuentaService } from '@/core/services/cuenta/cuenta.service';
import {
    NuevoProveedorComponent
} from '@/module/cuentas/component/nuevo-proveedor/nuevo-proveedor.component';
import { Proveedor } from '@/models/cuenta/proveedor';
import { AccountComponent } from '@/shared/component/account/account.component';

@Component({
    selector: 'app-unidad-admin',
    standalone: true,
    imports: [NgOptimizedImage, RouterLink, FormsModule, IconField, InputIcon, InputText, Button, Dialog, NuevoProveedorComponent, AccountComponent],
    templateUrl: './account-dashboard.html',
    styleUrl: './account-dashboard.scss'
})
export class AccountDashboard implements OnInit, OnDestroy {
    protected accounts: Proveedor[] = [];
    protected modalNuevoProveedor: boolean;
    private accountService = inject(CuentaService);
    private filterService = inject(FilterService);
    private cuentasOriginales: Proveedor[] = [];
    private filtroProveedor$ = new Subject<string>();
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.obtenerProveedores();
        this.filtroProveedor$.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((texto) => this.aplicarFiltro(texto));
    }

    onInputCambiado(valor: string): void {
        this.filtroProveedor$.next(valor);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    abrirProveedor() {
        this.modalNuevoProveedor = true;
    }

    actualizarProveedores($event: boolean) {
        this.modalNuevoProveedor = false;
        if ($event) {
            this.obtenerProveedores();
        }
    }

    private aplicarFiltro(valor: string): void {
        const texto = valor?.trim().toLowerCase() ?? '';

        this.accounts = texto ? this.filterService.filter(this.cuentasOriginales, ['nombre'], texto, 'contains') : [...this.cuentasOriginales];
    }

    private obtenerProveedores() {
        this.accountService.obtenerProveedores().subscribe({
            next: (result) => {
                this.cuentasOriginales = result.data;
                this.accounts = [...this.cuentasOriginales];
            }
        });
    }
}
