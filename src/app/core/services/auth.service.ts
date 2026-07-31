import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { UserRole } from '../models/role.enum';
import { AuthSession, LoginResponse } from '../models/auth.model';
import { StorageService } from './storage.service';
import { ClientService } from './client.service';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { APP_ROUTES } from '../constants/routes.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private storageService = inject(StorageService);
  private clientService = inject(ClientService);

  public currentUserSignal = signal<User | null>(null);
  public currentRoleSignal = signal<string | null>(null);
  public currentTenantSignal = signal<string | null>(null);
  public isAuthenticatedSignal = signal<boolean>(false);

  constructor() {
    this.restoreSession();
    this.listenToCrossTabLogout();
  }

  /**
   * Restores the tenant-scoped session from localStorage on initial page load,
   * refresh, or a newly opened tab. The stored session already carries the
   * tenant it belongs to, so authentication can never leak across tenants.
   */
  private restoreSession(): void {
    const sessionStr = this.storageService.getItem(STORAGE_KEYS.AUTH_SESSION);

    if (!sessionStr) {
      return;
    }

    try {
      const session: AuthSession = JSON.parse(sessionStr);
      if (this.isValidSession(session)) {
        this.applySession(session);
      } else {
        this.clearSession();
      }
    } catch (e) {
      this.clearSession();
    }
  }

  /**
   * A session is only valid when it carries a token, a user and an explicit
   * tenant (clientId). Any session missing these is treated as invalid.
   */
  private isValidSession(session: AuthSession): boolean {
    return !!(session && session.token && session.user && session.clientId);
  }

  private applySession(session: AuthSession): void {
    this.currentUserSignal.set(session.user);
    this.currentRoleSignal.set(session.role || session.user.role);
    this.currentTenantSignal.set(session.clientId);
    this.isAuthenticatedSignal.set(true);
  }

  /**
   * Listens for storage changes from other browser tabs (multi-tab logout synchronization).
   */
  private listenToCrossTabLogout(): void {
    this.storageService.getStorageChanges().subscribe(({ key, newValue }) => {
      if (key === STORAGE_KEYS.AUTH_SESSION && !newValue) {
        // Session was removed in another tab -> Logout immediately in this tab too!
        this.handleImmediateLocalLogout();
      }
    });
  }

  /**
   * Performs mock authentication against the ACTIVE tenant's mock credentials.
   * The resulting session is explicitly bound to the tenant that was active
   * at login time (the tenant currently present in the URL).
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    const currentClient = this.clientService.currentClientSignal();

    if (!currentClient) {
      return of({ success: false, errorKey: 'LOGIN.ERRORS.CLIENT_NOT_FOUND' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check credentials match in the tenant's mock credentials list
    const mockCred = currentClient.mockCredentials.find(
      c => c.username.toLowerCase() === cleanUsername && c.password === cleanPassword
    );

    // Also match user in the tenant's user array
    const matchedUser = currentClient.users.find(
      u => u.email.toLowerCase() === cleanUsername
    );

    if (mockCred || matchedUser) {
      const user: User = matchedUser || {
        id: 'mock-usr-' + Date.now(),
        firstName: cleanUsername.split('@')[0],
        lastName: 'User',
        email: cleanUsername,
        dob: '1990-01-01',
        department: currentClient.departments[0] || 'General',
        role: mockCred ? mockCred.role : UserRole.USER
      };

      const mockToken = `jwt-mock-token-${Date.now()}-${currentClient.clientId}`;
      const userRole = mockCred ? mockCred.role : user.role;

      // Persist a single tenant-scoped session to localStorage
      const session: AuthSession = {
        token: mockToken,
        user,
        role: userRole,
        clientId: currentClient.clientId,
        loginTimestamp: Date.now()
      };
      this.storageService.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

      // Update signal states
      this.applySession(session);

      return of({
        success: true,
        token: mockToken,
        user,
        role: userRole,
        clientId: currentClient.clientId
      });
    }

    return of({ success: false, errorKey: 'LOGIN.ERRORS.INVALID_CREDENTIALS' });
  }

  /**
   * Logs out the user: clears the tenant-scoped session, resets signals and
   * redirects to the active tenant's login page.
   */
  public logout(redirect: boolean = true): void {
    const targetTenant =
      this.clientService.getClientId() ||
      this.currentTenantSignal() ||
      APP_ROUTES.DEFAULT_CLIENT_ID;

    this.clearSession();

    if (redirect) {
      this.router.navigate(['/', targetTenant, APP_ROUTES.LOGIN]);
    }
  }

  /**
   * Clears any stored authentication data and resets all auth signals.
   */
  public clearSession(): void {
    this.storageService.removeItem(STORAGE_KEYS.AUTH_SESSION);
    this.currentUserSignal.set(null);
    this.currentRoleSignal.set(null);
    this.currentTenantSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  private handleImmediateLocalLogout(): void {
    const targetTenant =
      this.clientService.getClientId() ||
      this.currentTenantSignal() ||
      APP_ROUTES.DEFAULT_CLIENT_ID;

    this.clearSession();

    this.router.navigate(['/', targetTenant, APP_ROUTES.LOGIN]);
  }

  /**
   * True only when a complete, valid session (token + user + tenant) exists.
   * A bare token or user alone is never treated as an authenticated state.
   */
  public isLoggedIn(): boolean {
    return (
      this.isAuthenticatedSignal() &&
      !!this.currentTenantSignal() &&
      !!this.currentUserSignal()
    );
  }

  public getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  public getCurrentRole(): string | null {
    return this.currentRoleSignal();
  }

  /**
   * The tenant that owns the currently authenticated session.
   * Returns null when no valid session exists.
   */
  public getCurrentTenant(): string | null {
    return this.currentTenantSignal();
  }

  /**
   * True only when there is a valid session AND that session belongs to the
   * given tenant. Used to enforce tenant isolation on every secured route.
   */
  public hasActiveSessionForTenant(tenantId: string | null | undefined): boolean {
    return !!tenantId && this.isLoggedIn() && this.currentTenantSignal() === tenantId;
  }

  public isSuperAdmin(): boolean {
    return this.currentRoleSignal() === UserRole.SUPER_ADMIN;
  }

  public isAdmin(): boolean {
    const role = this.currentRoleSignal();
    return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  }
}
