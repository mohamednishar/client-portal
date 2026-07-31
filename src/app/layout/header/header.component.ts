import { Component, inject, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { APP_ROUTES } from '../../core/constants/routes.constants';

interface BootstrapApi {
  Modal: {
    getOrCreateInstance(el: Element): { show(): void; hide(): void };
  };
}
declare const bootstrap: BootstrapApi;

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
        <a class="navbar-brand d-flex align-items-center text-white fw-bold me-4" [routerLink]="['/', routeTenant(), 'dashboard']">
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
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon filter-white"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Main Nav Links (only when the session belongs to this tenant) -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0" *ngIf="hasTenantSession()">
            <li class="nav-item me-2">
              <a
                class="nav-link text-white opacity-75 hover-opacity-100 d-flex align-items-center gap-1 px-3 rounded"
                [routerLink]="['/', routeTenant(), 'dashboard']"
                routerLinkActive="active bg-white bg-opacity-25 opacity-100 fw-bold">
                <i class="bi bi-speedometer2"></i>
                {{ 'NAV.DASHBOARD' | translate }}
              </a>
            </li>
            <li class="nav-item me-2">
              <a
                class="nav-link text-white opacity-75 hover-opacity-100 d-flex align-items-center gap-1 px-3 rounded"
                [routerLink]="['/', routeTenant(), 'users']"
                routerLinkActive="active bg-white bg-opacity-25 opacity-100 fw-bold">
                <i class="bi bi-people-fill"></i>
                {{ 'NAV.USERS' | translate }}
              </a>
            </li>
          </ul>

          <!-- Client Switcher Quick Pill (for machine test demonstration) -->
          <!-- <div class="d-flex align-items-center me-3 ms-auto ms-lg-0 my-2 my-lg-0">
            <div class="btn-group btn-group-sm rounded-pill p-1 bg-white bg-opacity-25">
              <button
                class="btn btn-sm text-white rounded-pill px-3"
                [class.bg-white]="routeTenant() === 'client-a'"
                [class.text-dark]="routeTenant() === 'client-a'"
                [class.fw-bold]="routeTenant() === 'client-a'"
                (click)="switchClient('client-a')">
                {{ 'NAV.CLIENT_A' | translate }}
              </button>
              <button
                class="btn btn-sm text-white rounded-pill px-3"
                [class.bg-white]="routeTenant() === 'client-b'"
                [class.text-dark]="routeTenant() === 'client-b'"
                [class.fw-bold]="routeTenant() === 'client-b'"
                (click)="switchClient('client-b')">
                {{ 'NAV.CLIENT_B' | translate }}
              </button>
            </div>
          </div> -->

          <!-- Controls Right: Language Switcher & User Profile -->
          <div class="d-flex align-items-center gap-3">
            <app-language-switcher></app-language-switcher>

            <!-- User Info & Logout (only when the session belongs to this tenant) -->
            <div class="d-flex align-items-center gap-2" *ngIf="hasTenantSession()">
              <div class="text-end d-none d-md-block">
                <div class="fw-bold text-white lh-1 small">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</div>
                <span class="badge bg-light text-dark mt-1" style="font-size: 0.7rem;">{{ currentRole() }}</span>
              </div>
              <button
                class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm"
                (click)="onLogoutRequest()"
                [attr.title]="'NAV.LOGOUT' | translate">
                <i class="bi bi-box-arrow-right fs-6"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>

    <!-- Logout Confirmation Modal -->
    <div class="modal fade" id="logoutConfirmModal" #logoutModal tabindex="-1" aria-labelledby="logoutConfirmTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header">
            <h5 class="modal-title fw-bold" id="logoutConfirmTitle">
              <i class="bi bi-box-arrow-right text-danger me-2"></i>
              {{ 'LOGOUT_CONFIRM.TITLE' | translate }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted m-0">{{ 'LOGOUT_CONFIRM.MESSAGE' | translate }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary shadow-sm" data-bs-dismiss="modal">
              {{ 'LOGOUT_CONFIRM.CANCEL_BTN' | translate }}
            </button>
            <button type="button" class="btn btn-danger shadow-sm d-flex align-items-center gap-2" (click)="confirmLogout()">
              <i class="bi bi-box-arrow-right"></i>
              {{ 'LOGOUT_CONFIRM.CONFIRM_BTN' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('logoutModal') private logoutModalRef!: ElementRef;

  public currentUser = this.authService.currentUserSignal;
  public currentRole = this.authService.currentRoleSignal;

  public clientName = () => this.clientService.getClientName();

  /**
   * The tenant present in the current URL (route tenant).
   */
  public routeTenant = (): string =>
    this.route.snapshot.paramMap.get(APP_ROUTES.PARAM_CLIENT_ID) ||
    this.route.snapshot.parent?.paramMap.get(APP_ROUTES.PARAM_CLIENT_ID) ||
    this.clientService.getClientId() ||
    APP_ROUTES.DEFAULT_CLIENT_ID;

  /**
   * True only when a valid session exists for the CURRENT route tenant.
   * This prevents another tenant's session from rendering here.
   */
  public hasTenantSession = () => this.authService.hasActiveSessionForTenant(this.routeTenant());

  public switchClient(newClientId: string): void {
    if (this.routeTenant() === newClientId) return;

    // Only navigate straight to the dashboard if a session already exists for the target tenant.
    const targetRoute = this.authService.hasActiveSessionForTenant(newClientId)
      ? APP_ROUTES.DASHBOARD
      : APP_ROUTES.LOGIN;
    this.router.navigate(['/', newClientId, targetRoute]);
  }

  public onLogoutRequest(): void {
    bootstrap.Modal.getOrCreateInstance(this.logoutModalRef.nativeElement).show();
  }

  public confirmLogout(): void {
    bootstrap.Modal.getOrCreateInstance(this.logoutModalRef.nativeElement).hide();
    this.authService.logout(true);
  }
}
