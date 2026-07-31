import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { UserRole } from '../models/role.enum';
import { AuthSession, LoginResponse } from '../models/auth.model';
import { StorageService } from './storage.service';
import { ClientService } from './client.service';
import { STORAGE_KEYS } from '../constants/storage.keys';

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
   * Restores tenant-aware session from localStorage on initial page load, refresh, or tab open.
   */
  private restoreSession(): void {
    const token = this.storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userStr = this.storageService.getItem(STORAGE_KEYS.CURRENT_USER);
    const role = this.storageService.getItem(STORAGE_KEYS.CURRENT_ROLE);
    const tenant = this.storageService.getItem(STORAGE_KEYS.CURRENT_TENANT);

    if (token && userStr && tenant) {
      try {
        const user: User = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        this.currentRoleSignal.set(role || user.role);
        this.currentTenantSignal.set(tenant);
        this.isAuthenticatedSignal.set(true);
      } catch (e) {
        this.logout(false);
      }
    }
  }

  /**
   * Listens for storage changes from other browser tabs (multi-tab logout synchronization).
   */
  private listenToCrossTabLogout(): void {
    this.storageService.getStorageChanges().subscribe(({ key, newValue }) => {
      if (key === STORAGE_KEYS.AUTH_TOKEN && !newValue) {
        this.handleImmediateLocalLogout();
      }
    });
  }

  /**
   * Tenant-aware login matching credentials against the target client portal.
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    const currentClient = this.clientService.currentClientSignal();

    if (!currentClient) {
      return of({ success: false, errorKey: 'LOGIN.ERRORS.CLIENT_NOT_FOUND' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const mockCred = currentClient.mockCredentials.find(
      c => c.username.toLowerCase() === cleanUsername && c.password === cleanPassword
    );

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
      const tenantId = currentClient.clientId;

      // Persist TENANT-SCOPED authentication session to localStorage
      this.storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      this.storageService.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.storageService.setItem(STORAGE_KEYS.CURRENT_ROLE, userRole);
      this.storageService.setItem(STORAGE_KEYS.CURRENT_TENANT, tenantId);

      // Update Signals
      this.currentUserSignal.set(user);
      this.currentRoleSignal.set(userRole);
      this.currentTenantSignal.set(tenantId);
      this.isAuthenticatedSignal.set(true);

      return of({ success: true, token: mockToken, tenant: tenantId, user });
    }

    return of({ success: false, errorKey: 'LOGIN.ERRORS.INVALID_CREDENTIALS' });
  }

  /**
   * Log out user: clear local storage, reset signals, and redirect to client login.
   */
  public logout(redirect: boolean = true): void {
    const activeTenant = this.getCurrentTenant() || this.clientService.getClientId() || 'client-a';

    this.storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.storageService.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.storageService.removeItem(STORAGE_KEYS.CURRENT_ROLE);
    this.storageService.removeItem(STORAGE_KEYS.CURRENT_TENANT);

    this.currentUserSignal.set(null);
    this.currentRoleSignal.set(null);
    this.currentTenantSignal.set(null);
    this.isAuthenticatedSignal.set(false);

    if (redirect) {
      this.router.navigate(['/', activeTenant, 'login']);
    }
  }

  private handleImmediateLocalLogout(): void {
    const activeTenant = this.getCurrentTenant() || 'client-a';
    this.currentUserSignal.set(null);
    this.currentRoleSignal.set(null);
    this.currentTenantSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/', activeTenant, 'login']);
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticatedSignal();
  }

  public getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  public getCurrentRole(): string | null {
    return this.currentRoleSignal();
  }

  public getCurrentTenant(): string | null {
    return this.currentTenantSignal();
  }

  /**
   * Validates if the authenticated user session matches the requested route tenant ID.
   * Mandates strict tenant isolation (STEP 5 & 7A).
   */
  public validateTenantAccess(requestedTenantId: string): boolean {
    if (!this.isLoggedIn()) {
      return false;
    }

    const authenticatedTenant = this.getCurrentTenant();
    return authenticatedTenant === requestedTenantId;
  }

  public isSuperAdmin(): boolean {
    return this.currentRoleSignal() === UserRole.SUPER_ADMIN;
  }

  public isAdmin(): boolean {
    const role = this.currentRoleSignal();
    return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
  }
}
