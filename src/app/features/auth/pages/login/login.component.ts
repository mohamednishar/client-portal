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
  templateUrl: './login.component.html'
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
