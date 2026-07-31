import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { routeAnimations } from '../../core/animations/route.animations';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-light">
      <app-header></app-header>
      
      <main class="flex-grow-1 position-relative py-4">
        <div [@routeAnimations]="prepareRoute(outlet)">
          <router-outlet #outlet="outlet"></router-outlet>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `
})
export class MainLayoutComponent {
  public prepareRoute(outlet: RouterOutlet): string {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
