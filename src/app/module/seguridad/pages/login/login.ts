import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import {finalize, Subject, takeUntil} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '@/core/services/auth/AuthService';

interface LoginForm {
    username: string;
    password: string;
}

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, NgClass],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class Login implements OnInit, OnDestroy {
    // <-- Implementa OnDestroy
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';
    showError = false;

    // Creamos un Subject que actuará como señal para desuscribirnos
    private destroy$ = new Subject<void>();

    constructor(private authService: AuthService, private router: Router) {
    }

    ngOnInit(): void {
        // Si ya está logueado, redirige al dashboard
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/']); // o '/dashboard' según tu app
        }
        this.loginForm = new FormGroup({
            username: new FormControl(null, [Validators.required]),
            password: new FormControl(null, [Validators.required, Validators.minLength(6)])
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.showError = false;

            this.authService
                .login(this.loginForm.value)
                .pipe(// La magia ocurre aquí: la suscripción se cerrará automáticamente
                    // cuando el Observable 'destroy$' emita un valor.
                    takeUntil(this.destroy$), finalize(() => {
                        this.isLoading = false;
                    }))
                .subscribe({
                    next: (response) => {
                        console.log('Inicio de sesión exitoso:', response);
                        this.showError = false;
                        this.loginForm.reset();
                        this.router.navigate(['/']);
                    }, error: (error) => {
                        this.showError = true;
                        if (error.status === 401) {
                            this.errorMessage = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
                        } else if (error.status === 403) {
                            this.errorMessage = 'Acceso denegado. Tus credenciales han sido revocadas.';
                        } else if (error.status === 423) {
                            this.errorMessage = 'Cuenta bloqueada. Contacta al administrador.';
                        } else {
                            this.errorMessage = 'Error de conexión. Inténtalo nuevamente.';
                        }
                    }
                });
        }
    }

    // Hook del ciclo de vida que se ejecuta justo antes de que el componente sea destruido
    ngOnDestroy(): void {
        // Emitimos un valor para que takeUntil desuscriba todas las suscripciones
        this.destroy$.next();
        // Completamos el Subject para liberar los recursos
        this.destroy$.complete();
    }
}
