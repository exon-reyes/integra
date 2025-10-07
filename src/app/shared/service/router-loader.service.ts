import {Injectable} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import { LoaderService } from '@/shared/service/loader.service';

@Injectable({
  providedIn: 'root'
})
export class RouterLoaderService {
  constructor(private router: Router, private loaderService: LoaderService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();  // Mostrar loader al iniciar la navegación
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loaderService.hide();  // Ocultar loader al finalizar la navegación
      }
    });
  }
}
