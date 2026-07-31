import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientService } from '../../../../core/services/client.service';
import { ThemePreviewComponent } from '../../../../shared/components/theme-preview/theme-preview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ThemePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid px-4 py-2">
      <!-- Welcome Hero Banner -->
      <div class="card card-theme bg-client-header text-white p-4 p-md-5 mb-4 shadow border-0 overflow-hidden position-relative">
        <div class="row align-items-center position-relative z-1">
          <div class="col-lg-8 mb-3 mb-lg-0">
            <span class="badge bg-white text-dark mb-2 px-3 py-2 fw-bold text-uppercase shadow-sm">
              <i class="bi bi-shield-check me-1 text-client-primary"></i>
              {{ 'DASHBOARD.ROLE_WORKSPACE' | translate: { role: currentRole() } }}
            </span>
            <h2 class="fw-bold display-6 mb-2">
              {{ 'DASHBOARD.WELCOME_USER' | translate: { name: currentUser()?.firstName } }}
            </h2>
            <p class="lead opacity-90 m-0">
              {{ 'DASHBOARD.WELCOME_DESCRIPTION' | translate: { client: clientName() } }}
            </p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <a 
              [routerLink]="['/', clientId(), 'users']" 
              class="btn btn-light btn-lg text-client-primary fw-bold px-4 py-3 shadow hover-lift d-inline-flex align-items-center gap-2">
              <i class="bi bi-people-fill"></i>
              <span>{{ 'DASHBOARD.MANAGE_USERS_BTN' | translate }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Responsive Metrics Bootstrap Cards Grid (STEP 11) -->
      <div class="row g-4 mb-4">
        
        <!-- Total Users Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card card-theme h-100 p-4 border-start border-4 border-client-primary">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted text-uppercase fw-semibold small d-block mb-1">
                  {{ 'DASHBOARD.TOTAL_USERS' | translate }}
                </span>
                <h3 class="fw-bold m-0 text-dark">{{ totalUsersCount() }}</h3>
              </div>
              <div class="rounded-circle bg-client-primary text-white p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                <i class="bi bi-person-group fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top text-muted small d-flex align-items-center gap-1">
              <i class="bi bi-check-circle-fill text-success"></i>
              <span>{{ 'DASHBOARD.CARD_USERS_FOOTER' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Total Departments Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card card-theme h-100 p-4 border-start border-4 border-success">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted text-uppercase fw-semibold small d-block mb-1">
                  {{ 'DASHBOARD.TOTAL_DEPARTMENTS' | translate }}
                </span>
                <h3 class="fw-bold m-0 text-dark">{{ totalDeptsCount() }}</h3>
              </div>
              <div class="rounded-circle bg-success text-white p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                <i class="bi bi-diagram-3-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top text-muted small d-flex align-items-center gap-1">
              <i class="bi bi-building text-success"></i>
              <span>{{ 'DASHBOARD.CARD_DEPTS_FOOTER' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Active Client Info Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card card-theme h-100 p-4 border-start border-4 border-info">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted text-uppercase fw-semibold small d-block mb-1">
                  {{ 'DASHBOARD.ACTIVE_CLIENT' | translate }}
                </span>
                <h5 class="fw-bold m-0 text-dark text-truncate" style="max-width: 160px;">{{ clientName() }}</h5>
              </div>
              <div class="rounded-circle bg-info text-white p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                <i class="bi bi-building-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top text-muted small d-flex align-items-center gap-1">
              <i class="bi bi-link-45deg text-info"></i>
              <span>{{ 'DASHBOARD.CLIENT_ID' | translate: { id: clientId() } }}</span>
            </div>
          </div>
        </div>

        <!-- Current User Role Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card card-theme h-100 p-4 border-start border-4 border-warning">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-muted text-uppercase fw-semibold small d-block mb-1">
                  {{ 'DASHBOARD.ACTIVE_ROLE' | translate }}
                </span>
                <h5 class="fw-bold m-0 text-dark">{{ currentRole() }}</h5>
              </div>
              <div class="rounded-circle bg-warning text-dark p-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                <i class="bi bi-person-badge-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top text-muted small d-flex align-items-center gap-1">
              <i class="bi bi-shield-lock text-warning"></i>
              <span>{{ (isSuperAdmin() ? 'DASHBOARD.FULL_ACCESS' : 'DASHBOARD.STANDARD_ACCESS') | translate }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Section: Theme Swatch Preview & Client User Quick Roster -->
      <div class="row g-4">
        <!-- Theme Swatch Preview Component -->
        <div class="col-12 col-lg-5 col-xl-4" *ngIf="clientTheme()">
          <app-theme-preview [theme]="clientTheme()!"></app-theme-preview>
        </div>

        <!-- Department Summary List -->
        <div class="col-12 col-lg-7 col-xl-8">
          <div class="card card-theme h-100 p-4">
            <h6 class="fw-bold text-muted mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-diagram-3 text-client-primary"></i>
              <span>{{ 'DASHBOARD.CONFIGURED_DEPARTMENTS' | translate }}</span>
            </h6>
            <div class="d-flex flex-wrap gap-2">
              <div *ngFor="let dept of departments()" class="badge bg-light text-dark border p-2.5 rounded-pill fs-6 fw-normal d-flex align-items-center gap-2 shadow-sm">
                <i class="bi bi-folder2-open text-client-primary"></i>
                <span>{{ dept }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private clientService = inject(ClientService);

  public currentUser = this.authService.currentUserSignal;
  public currentRole = this.authService.currentRoleSignal;
  public isSuperAdmin = () => this.authService.isSuperAdmin();

  public clientId = () => this.clientService.getClientId() || 'client-a';
  public clientName = () => this.clientService.getClientName();
  public clientTheme = () => this.clientService.currentClientSignal()?.theme;
  public departments = () => this.clientService.getDepartments();

  public totalUsersCount = computed(() => this.clientService.getUsers().length);
  public totalDeptsCount = computed(() => this.clientService.getDepartments().length);
}
