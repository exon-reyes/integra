import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <div class="px-5 py-4 shadow-md flex z-50 bg-white items-center justify-between relative lg:fixed w-full">
                    <a class="flex items-center" href="#">
                        <img src="assets/icon/sci.svg" alt="icon" height="40" width="54" class="h-12 mr-2" />
                        <span class="text-surface-900 dark:text-surface-0 font-medium text-2xl leading-normal mr-20">Integra</span>
                    </a>

                    <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:hidden!" pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true">
                        <i class="pi pi-bars text-2xl!"></i>
                    </a>

                    <div class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border">
                        <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
                            <li>
                                <a (click)="router.navigate(['/'], { fragment: 'home' })" pRipple class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                                    <span>Inicio</span>
                                </a>
                            </li>
                            <li>
                                <a (click)="router.navigate(['/'], { fragment: 'mods' })" pRipple class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                                    <span>Características</span>
                                </a>
                            </li>
                            <li>
                                <a (click)="router.navigate(['/'], { fragment: 'opt' })" pRipple class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                                    <span>Integraciones</span>
                                </a>
                            </li>
                        </ul>
                        <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2">
                            <button [routerLink]="['auth/login']" class="rounded-3xl w-32 h-10 bg-blue-600 text-white justify-center">Iniciar sesión</button>
                        </div>
                    </div>
                </div>
                <div
                    class="flex flex-col pt-35 px-6 lg:px-20 overflow-hidden md:pt-60"
                    style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
                >
                    <div class="mx-6 md:mx-20 md:mt-10">
                        <h1 class="text-6xl font-bold text-gray-900 leading-tight dark:!text-gray-700">Estrategia en evolución</h1>
                        <p class="font-normal text-2xl  max-w-3xl leading-normal md:mt-4 text-gray-700 dark:text-gray-700">Plataforma integral para la gestión eficiente de empleados, seguimiento preciso del tiempo laboral, control de incidentes y observaciones, y administración segura de recursos humanos y tecnológicos.</p>
                    </div>
                    <div class="md:mt-5 flex justify-center md:justify-end">
                        <img src="assets/img/bg1.png" alt="bg1" class="w-9/12 md:w-200" />
                    </div>
                </div>
                <div class="min-h-screen  text-slate-800">
                    <section class="relative py-30 overflow-hidden">
                        <div class="absolute inset-0 z-0 opacity-10" style="background-image: radial-gradient(circle, #a78bfa 1px, transparent 1px); background-size: 20px 20px;"></div>
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                            <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600 mb-3">Estrategia en Evolución</p>
                            <h1 class="text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-8">Gestión de procesos con <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">Integra</span></h1>
                            <div class="text-xl text-slate-600 max-w-4xl mx-auto mb-12">
                                Una plataforma unificada para gestionar tus <b>Recursos Humanos, Infraestructura TI y Operaciones Generales</b>, diseñada para impulsar la eficiencia y el crecimiento.
                            </div>
                        </div>
                    </section>

                    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  -mt-15">
                        <div class="grid grid-cols-3 gap-6 bg-white p-8 rounded-2xl shadow-2xl border border-slate-100">
                            <div class="flex flex-col items-center text-center space-y-2 py-4 lg:border-r border-slate-200">
                                <div class="bg-indigo-50 p-3 rounded-full flex-shrink-0">
                                   <i style="font-size: 1.5rem" class="pi pi-box"></i>
                                </div>
                                <p class="text-3xl font-bold text-slate-900">3</p>
                                <p class="text-slate-500 text-sm">Módulos de operación</p>
                            </div>

                            <div class="flex flex-col items-center text-center space-y-2 py-4 lg:border-r border-slate-200">
                                <div class="bg-indigo-50 p-3 rounded-full flex-shrink-0">
                                    <i style="font-size: 1.5rem" class="pi pi-gauge"></i>
                                </div>
                                <p class="text-3xl font-bold text-slate-900">8+</p>
                                <p class="text-slate-500 text-sm">Procesos integrados</p>
                            </div>

                            <div class="flex flex-col items-center text-center space-y-2 py-4 border-slate-200">
                                <div class="bg-indigo-50 p-3 rounded-full flex-shrink-0">
                                    <i style="font-size: 1.5rem" class="pi pi-user "></i>
                                </div>
                                <p class="text-3xl font-bold text-slate-900">50+</p>
                                <p class="text-slate-500 text-sm">Acciones personalizadas</p>
                            </div>
                        </div>
                    </section>

                    <section id="mods" class="bg-white mt-35">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div class="text-center mb-16">
                                <h2 class="text-4xl font-bold text-slate-900">La mejora continua como estrategia</h2>
                                <p class="text-xl text-slate-600 mx-auto">Cada módulo de <b>Integra</b> está diseñado para brindarte el control absoluto y simplificar tus operaciones.</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-10">
                                <div class="bg-white rounded-xl p-8 shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div class="flex items-center space-x-4 mb-5">
                                        <div class="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 3a9 9 0 0 0 0 18A9 9 0 0 0 12 3Z M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                                            </svg>
                                        </div>
                                        <h3 class="text-2xl font-bold text-slate-900">Generales</h3>
                                    </div>
                                    <p class="text-slate-600 mb-6">Gestión centralizada de unidades operativas, zonas geográficas, horarios operativos y la información de contacto esencial para tu empresa.</p>
                                    <ul class="space-y-3">
                                        <li class="flex items-start space-x-2 text-slate-700 ">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Gestión de Unidades</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Control de Zonas</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Horarios Operativos</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Información de Contacto</span>
                                        </li>
                                    </ul>
                                </div>

                                <div class="bg-white rounded-xl p-8 shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div class="flex items-center space-x-4 mb-5">
                                        <div class="p-3 rounded-lg bg-gradient-to-r from-green-600 to-green-800 text-white">
                                            <i class="pi pi-user"></i>
                                        </div>
                                        <h3 class="text-2xl font-bold text-slate-900">Gestión RRHH</h3>
                                    </div>
                                    <p class="text-slate-600 mb-6">Control integral de empleados, asistencia, compensaciones, reloj checador y gestión de observaciones e incidentes, optimizando la administración de personal.</p>
                                    <ul class="space-y-3">
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Base de Empleados</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Sistema de Asistencia</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Compensaciones</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Observaciones e Incidentes</span>
                                        </li>
                                    </ul>
                                </div>

                                <div class="bg-white rounded-xl p-8 shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div class="flex items-center space-x-4 mb-5">
                                        <div class="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                                            <i class="pi pi-th-large" style="font-size: 1.5rem"></i>
                                        </div>
                                        <h3 class="text-2xl font-bold text-slate-900">Gestión TI</h3>
                                    </div>
                                    <p class="text-slate-600 mb-6">Administración robusta de roles, usuarios, credenciales, tipos de cuenta y permisos, asegurando un entorno tecnológico seguro y controlado.</p>
                                    <ul class="space-y-3">
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Gestión de Roles</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Administración de Usuarios</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Credenciales</span>
                                        </li>
                                        <li class="flex items-start space-x-2 text-slate-700">
                                            <i class="pi pi-check text-green-500 mt-1"></i>
                                            <span class="font-medium text-base">Permisos y Autorizaciones</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="opt" class="mt-25">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div class="text-center mx-auto mb-16">
                                <h2 class="text-4xl font-bold text-slate-900 mb-4 transition duration-500 hover:scale-105 hover:text-indigo-600">Impulso al crecimiento sostenible</h2>
                                <p class="text-xl text-slate-600 mx-auto">Facilitamos la mejora continua con soluciones flexibles, diseñadas para escalar la capacidad operativa</p>
                            </div>
                            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div class="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl border border-slate-100 transition duration-500 hover:scale-105">
                                    <div class="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M13 2H3v10l9 9 10-10-9-9Z M7 9h.01" />
                                        </svg>
                                    </div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2 ">Automatización Inteligente</h4>
                                    <p class="text-slate-600 text-sm">Optimiza procesos repetitivos y ahorra tiempo valioso en operaciones diarias.</p>
                                </div>

                                <div class="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl border border-slate-100 transition duration-500 hover:scale-105">
                                    <div class="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                                        </svg>
                                    </div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">Seguridad Empresarial</h4>
                                    <p class="text-slate-600 text-sm">Protocolos avanzados de autenticación y autorización protegen tus datos sensibles y operaciones críticas.</p>
                                </div>

                                <div class="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl border border-slate-100 transition duration-500 hover:scale-105">
                                    <div class="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z M12 6v6l4 2" />
                                        </svg>
                                    </div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">Tiempo Real</h4>
                                    <p class="text-slate-600 text-sm">Información actualizada al instante para tomar decisiones informadas.</p>
                                </div>

                                <div class="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl border border-slate-100 transition duration-500 hover:scale-105">
                                    <div class="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M18 10h-6V4l-6 6h6v6l-6-6" />
                                        </svg>
                                    </div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">Reportes</h4>
                                    <p class="text-slate-600 text-sm">Genera reportes detallados de asistencia, incidentes y rendimiento para una toma de decisiones efectiva.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="py-28 bg-gradient-to-b from-white to-slate-50">
                        <div class="max-w-7xl mx-auto px-4">

                            <div class="text-center mb-20">
                                <h2 class="text-4xl font-extrabold text-slate-900 mb-4">
                                    Ecosistema de integración
                                </h2>
                                <p class="text-lg text-slate-600 mx-auto">
                                    Tecnología escalable, segura y optimizada para el rendimiento.
                                </p>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">

                                <!-- ITEM -->
                                <div class="group p-6 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                        border border-slate-200 relative overflow-hidden
                        hover:scale-[1.06] transition-all duration-300">

                                    <!-- Soft glow (light → brighter on hover) -->
                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-40
                            bg-gradient-to-br from-white via-sky-100 to-blue-200
                            blur-2xl transition-all duration-500 backdrop-blur-sm">
                                    </div>

                                    <img src="/assets/logo/spring.svg"
                                         class="h-12 mt-6 mx-auto relative z-10">
                                </div>

                                <!-- ITEM -->
                                <div class="group p-6 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                        border border-slate-200 relative overflow-hidden
                        hover:scale-[1.06] transition-all duration-300">

                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-40
                            bg-gradient-to-br from-white via-sky-100 to-blue-200
                            blur-2xl transition-all duration-500 backdrop-blur-sm">
                                    </div>

                                    <img src="/assets/logo/auth0.svg"
                                         class="h-10 mt-6 mx-auto relative z-10">
                                </div>

                                <!-- ITEM -->
                                <div class="group p-6 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                        border border-slate-200 relative overflow-hidden
                        hover:scale-[1.06] transition-all duration-300">

                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-40
                            bg-gradient-to-br from-white via-sky-100 to-blue-200
                            blur-2xl transition-all duration-500 backdrop-blur-sm">
                                    </div>

                                    <img src="/assets/logo/mariadb.svg"
                                         class="h-8 mt-6 mx-auto relative z-10">
                                </div>

                                <!-- ITEM -->
                                <div class="group p-6 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                        border border-slate-200 relative overflow-hidden
                        hover:scale-[1.06] transition-all duration-300">

                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-40
                            bg-gradient-to-br from-white via-sky-100 to-blue-200
                            blur-2xl transition-all duration-500 backdrop-blur-sm">
                                    </div>

                                    <img src="/assets/logo/angular.svg"
                                         class="h-20 mx-auto relative z-10">
                                </div>

                                <!-- ITEM -->
                                <div class="group p-6 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                        border border-slate-200 relative overflow-hidden
                        hover:scale-[1.06] transition-all duration-300">

                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-40
                            bg-gradient-to-br from-white via-sky-100 to-blue-200
                            blur-2xl transition-all duration-500 backdrop-blur-sm">
                                    </div>

                                    <img src="/assets/logo/tailwindcss.svg"
                                         class="h-4 mt-8 mx-auto relative z-10">
                                </div>

                                <!-- ITEM -->
                                <div class="group p-6 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                        border border-slate-200 relative overflow-hidden
                        hover:scale-[1.06] transition-all duration-300">

                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-40
                            bg-gradient-to-br from-white via-sky-100 to-blue-200
                            blur-2xl transition-all duration-500 backdrop-blur-sm">
                                    </div>

                                    <img src="/assets/logo/caddy.svg"
                                         class="h-9 mt-6 mx-auto relative z-10">
                                </div>

                            </div>
                        </div>
                    </section>




                    @defer (on viewport) {
                        <footer class="bg-slate-900 text-white py-8">
                            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div class="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                                    <div class="mb-4 md:mb-0">
                                        <div class="flex items-center justify-center md:justify-start space-x-2">
                                            <span class="text-2xl font-bold">Integra</span>
                                        </div>
                                        <p class="text-slate-400 text-sm mt-1">Estrategia en evolución | v1.0</p>
                                    </div>
                                    <div class="text-slate-500 text-sm">Exon &copy; 2025 Todos los derechos reservados.</div>
                                </div>
                            </div>
                        </footer>
                    } @placeholder {
                        <div class="h-12 w-full bg-gray-200 animate-pulse"></div>
                    }
                </div>
            </div>
        </div>
    `
})
export class Landing {
    constructor(protected router: Router) {}
}
