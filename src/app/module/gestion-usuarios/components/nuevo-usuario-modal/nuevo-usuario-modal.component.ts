import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

// Services
import { Rol, RolService } from '@/module/rol-admin/service/rol.service';
import { UsuarioService } from '@/core/services/usuario/usuario.service';
import { MessageService } from 'primeng/api';
import { CreateUserRequest } from '@/models/usuario/create-user-request';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-nuevo-usuario-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, PasswordModule, Select],
    templateUrl: './nuevo-usuario-modal.component.html',
    styleUrls: ['./nuevo-usuario-modal.component.scss']
})
export class NuevoUsuarioModalComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() usuarioCreado = new EventEmitter<void>();

    usuarioForm: FormGroup;
    roles: Rol[] = [];
    loading: boolean = false;
    loadingRoles: boolean = false;

    private fb = inject(FormBuilder);
    private rolService = inject(RolService);
    private usuarioService = inject(UsuarioService);
    private messageService = inject(MessageService);

    constructor() {
        this.usuarioForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
            fullname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            rol: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        this.cargarRoles();
    }

    cargarRoles() {
        this.loadingRoles = true;
        this.rolService.obtenerRoles().subscribe({
            next: (response) => {
                this.roles = response.data;
                this.loadingRoles = false;
            },
            error: (error) => {
                console.error('Error al cargar roles:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los roles disponibles',
                    life: 4000
                });
                this.loadingRoles = false;
            }
        });
    }

    onSubmit() {
        if (this.usuarioForm.valid) {
            this.loading = true;

            const formData = this.usuarioForm.value;
            const createUserRequest: CreateUserRequest = {
                username: formData.username,
                password: formData.password,
                fullname: formData.fullname,
                email: '', // Campo opcional
                enabled: true,
                roles: [formData.rol], // Enviar como número
                permissions: []
            };

            this.usuarioService.crearUsuario(createUserRequest).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Usuario Creado',
                        detail: 'El usuario ha sido creado exitosamente',
                        life: 3000
                    });
                    this.resetForm();
                    this.onCancel();
                    this.usuarioCreado.emit();
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                }
            });
        } else {
            // Marcar todos los campos como tocados para mostrar errores
            Object.keys(this.usuarioForm.controls).forEach((key) => {
                this.usuarioForm.get(key)?.markAsTouched();
            });
        }
    }

    onCancel() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.resetForm();
    }

    private resetForm() {
        this.usuarioForm.reset();
        Object.keys(this.usuarioForm.controls).forEach((key) => {
            this.usuarioForm.get(key)?.setErrors(null);
        });
    }
}
