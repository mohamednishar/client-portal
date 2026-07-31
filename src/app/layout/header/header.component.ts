import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    TranslateModule, 
    LanguageSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar navbar-expand-lg bg-client-header shadow-sm py-2 sticky-top">
      <div class="container-fluid px-4">
        <!-- Brand / Client Info -->
        <a class="navbar-brand d-flex align-items-center text-white fw-bold me-4" [routerLink]="['/', clientId(), 'dashboard']">
          <div class="rounded-circle bg-white text-primary p-2 me-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
            <i class="bi bi-building-gear fs-5 text-client-primary"></i>
          </div>
          <span>{{ clientName() }}</span>
        </a>

        <!-- Mobile Toggler -->
        <button 
          class="navbar-toggler border-white text-white" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon filter-white"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Main Nav Links (Authenticated) -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0" *ngIf="isLoggedIn()">
            <li class="nav-item me-2">
              <a 
                class="nav-link text-white opacity-75 hover-opacity-100 d-flex align-items-center gap-1 px-3 rounded" 
                [routerLink]="['/', clientId(), 'dashboard']" 
                routerLinkActive="active bg-white bg-opacity-25 opacity-100 fw-bold">
                <i class="bi bi-speedometer2"></i>
                {{ 'NAV.DASHBOARD' | translate }}
              </a>
            </li>
            <li class="nav-item me-2">
              <a 
                class="nav-link text-white opacity-75 hover-opacity-100 d-flex align-items-center gap-1 px-3 rounded" 
                [routerLink]="['/', clientId(), 'users']" 
                routerLinkActive="active bg-white bg-opacity-25 opacity-100 fw-bold">
                <i class="bi bi-people-fill"></i>
                {{ 'NAV.USERS' | translate }}
              </a>
            </li>
          </ul>

          <!-- Client Switcher Quick Pill (for machine test demonstration) -->
          <div class="d-flex align-items-center me-3 ms-auto ms-lg-0 my-2 my-lg-0">
            <div class="btn-group btn-group-sm rounded-pill p-1 bg-white bg-opacity-25">
              <button 
                class="btn btn-sm text-white rounded-pill px-3" 
                [class.bg-white]="clientId() === 'client-a'"
                [class.text-dark]="clientId() === 'client-a'"
                [class.fw-bold]="clientId() === 'client-a'"
                (click)="switchClient('client-a')">
                Client A
              </button>
              <button 
                class="btn btn-sm text-white rounded-pill px-3" 
                [class.bg-white]="clientId() === 'client-b'"
                [class.text-dark]="clientId() === 'client-b'"
                [class.fw-bold]="clientId() === 'client-b'"
                (click)="switchClient('client-b')">
                Client B
              </button>
            </div>
          </div>

          <!-- Controls Right: Language Switcher & User Profile -->
          <div class="d-flex align-items-center gap-3">
            <app-language-switcher></app-language-switcher>

            <!-- User Info & Logout -->
            <div class="d-flex align-items-center gap-2" *ngIf="isLoggedIn()">
              <div class="text-end d-none d-md-block">
                <div class="fw-bold text-white lh-1 small">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</div>
                <span class="badge bg-light text-dark mt-1" style="font-size: 0.7rem;">{{ currentRole() }}</span>
              </div>
              <button 
                class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm" 
                (click)="onLogout()"
                [attr.title]="'NAV.LOGOUT' | translate">
                <i class="bi bi-box-arrow-right fs-6"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  public currentUser = this.authService.currentUserSignal;
  public currentRole = this.authService.currentRoleSignal;
  public isLoggedIn = this.authService.isAuthenticatedSignal;

  public clientId = () => this.clientService.getClientId() || 'client-a';
  public clientName = () => this.clientService.getClientName();

  public switchClient(newClientId: string): void {
    if (this.clientId() === newClientId) return;

    // Navigate to new client's current route or login
    const targetRoute = this.isLoggedIn() ? 'dashboard' : 'login';
    this.router.navigate(['/', newClientId, targetRoute]);
  }

  public onLogout(): void {
    this.authService.logout(true);
  }
}
