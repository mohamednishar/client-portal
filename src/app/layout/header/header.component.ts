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
  templateUrl: './header.component.html'
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
