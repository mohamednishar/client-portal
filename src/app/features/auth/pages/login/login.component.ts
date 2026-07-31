import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientService } from '../../../../core/services/client.service';
import { UserRole } from '../../../../core/models/role.enum';
import { MockCredential } from '../../../../core/models/client.model';
import { APP_ROUTES } from '../../../../core/constants/routes.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5">
          
          <div class="card card-theme border-0 shadow-lg overflow-hidden">
            <!-- Card Header with Dynamic Client Theme -->
            <div class="p-4 text-center text-white bg-client-header position-relative">
              <div class="rounded-circle bg-white text-primary mx-auto mb-3 d-flex align-items-center justify-content-center shadow" style="width: 64px; height: 64px;">
                <i class="bi bi-shield-lock-fill fs-2 text-client-primary"></i>
              </div>
              <h4 class="fw-bold mb-1">{{ clientName() }}</h4>
              <p class="small opacity-75 m-0">{{ 'LOGIN.SUBTITLE' | translate }}</p>
            </div>

            <div class="card-body p-4 p-md-5">
              
              <!-- Bootstrap Error Alert -->
              <div *ngIf="errorMessageSignal() as errorMsg" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
                <div>{{ errorMsg | translate }}</div>
                <button type="button" class="btn-close" (click)="clearError()" aria-label="Close"></button>
              </div>

              <!-- Reactive Form -->
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
                <!-- Username / Email Field -->
                <div class="mb-3">
                  <label for="username" class="form-label fw-semibold">
                    {{ 'LOGIN.USERNAME_LABEL' | translate }} <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">
                      <i class="bi bi-person"></i>
                    </span>
                    <input 
                      type="email" 
                      id="username" 
                      formControlName="username" 
                      class="form-control border-start-0" 
                      [class.is-invalid]="isFieldInvalid('username')"
                      [placeholder]="'LOGIN.USERNAME_PLACEHOLDER' | translate" 
                      autocomplete="username">
                  </div>
                  <div *ngIf="isFieldInvalid('username')" class="invalid-feedback d-block mt-1">
                    {{ 'LOGIN.ERRORS.REQUIRED_FIELDS' | translate }}
                  </div>
                </div>

                <!-- Password Field -->
                <div class="mb-4">
                  <label for="password" class="form-label fw-semibold">
                    {{ 'LOGIN.PASSWORD_LABEL' | translate }} <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0">
                      <i class="bi bi-key"></i>
                    </span>
                    <input 
                      type="password" 
                      id="password" 
                      formControlName="password" 
                      class="form-control border-start-0" 
                      [class.is-invalid]="isFieldInvalid('password')"
                      [placeholder]="'LOGIN.PASSWORD_PLACEHOLDER' | translate" 
                      autocomplete="current-password">
                  </div>
                  <div *ngIf="isFieldInvalid('password')" class="invalid-feedback d-block mt-1">
                    {{ 'LOGIN.ERRORS.REQUIRED_FIELDS' | translate }}
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn btn-client-primary w-100 py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" 
                  [disabled]="isSubmittingSignal()">
                  <span *ngIf="isSubmittingSignal()" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i *ngIf="!isSubmittingSignal()" class="bi bi-box-arrow-in-right"></i>
                  <span>{{ 'LOGIN.SUBMIT_BTN' | translate }}</span>
                </button>
              </form>

              <!-- Quick Demo Credentials Section -->
              <div class="mt-4 pt-3 border-top" *ngIf="mockCredentials().length > 0">
                <div class="small fw-bold text-muted mb-2 text-center">
                  <i class="bi bi-lightning-charge-fill me-1 text-warning"></i>
                  {{ 'LOGIN.DEMO_ACCOUNTS' | translate }}
                </div>
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                  <button 
                    *ngFor="let cred of mockCredentials()" 
                    type="button" 
                    class="btn btn-sm btn-outline-secondary rounded-pill text-nowrap px-3 py-1"
                    (click)="fillDemoCredential(cred)">
                    <span class="fw-semibold">{{ cred.role }}:</span> 
                    <span class="small opacity-75 ms-1">{{ cred.username.split('@')[0] }}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public loginForm!: FormGroup;
  public errorMessageSignal = signal<string | null>(null);
  public isSubmittingSignal = signal<boolean>(false);

  public clientName = () => this.clientService.getClientName();
  public mockCredentials = () => this.clientService.currentClientSignal()?.mockCredentials || [];

  ngOnInit(): void {
    this.initForm();

    // Redirect to dashboard ONLY when already logged into THIS tenant.
    // A session owned by another tenant must never grant access here.
    const tenant = this.getRouteTenant();
    if (this.authService.isLoggedIn() && this.authService.getCurrentTenant() === tenant) {
      this.router.navigateByUrl(this.getSafeReturnUrl(tenant) || `/${tenant}/${APP_ROUTES.DASHBOARD}`);
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.isSubmittingSignal()));
  }

  public fillDemoCredential(cred: MockCredential): void {
    this.loginForm.patchValue({
      username: cred.username,
      password: cred.password
    });
    this.clearError();
  }

  public clearError(): void {
    this.errorMessageSignal.set(null);
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessageSignal.set('LOGIN.ERRORS.REQUIRED_FIELDS');
      return;
    }

    this.isSubmittingSignal.set(true);
    this.clearError();

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isSubmittingSignal.set(false);

        if (response.success) {
          const tenant = this.getRouteTenant();
          this.router.navigateByUrl(this.getSafeReturnUrl(tenant) || `/${tenant}/${APP_ROUTES.DASHBOARD}`);
        } else {
          this.errorMessageSignal.set(response.errorKey || 'LOGIN.ERRORS.INVALID_CREDENTIALS');
        }
      },
      error: () => {
        this.isSubmittingSignal.set(false);
        this.errorMessageSignal.set('LOGIN.ERRORS.INVALID_CREDENTIALS');
      }
    });
  }

  /**
   * The tenant this login page was reached for, taken from the URL.
   */
  private getRouteTenant(): string {
    return (
      this.route.snapshot.parent?.paramMap.get(APP_ROUTES.PARAM_CLIENT_ID) ||
      this.clientService.getClientId() ||
      APP_ROUTES.DEFAULT_CLIENT_ID
    );
  }

  /**
   * Only returns a returnUrl that belongs to the given tenant.
   * Cross-tenant return URLs are rejected to prevent tenant confusion.
   */
  private getSafeReturnUrl(tenant: string): string | null {
    const rawUrl = this.route.snapshot.queryParams['returnUrl'];
    if (typeof rawUrl === 'string' && rawUrl.startsWith(`/${tenant}/`)) {
      return rawUrl;
    }
    return null;
  }
}
