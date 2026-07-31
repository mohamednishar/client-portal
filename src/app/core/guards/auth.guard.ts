import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Extract requested tenant from route parameters
  const requestedTenant = route.paramMap.get('clientId') || 
                          route.parent?.paramMap.get('clientId') || 
                          'client-a';

  // Validate Tenant-Aware Authentication & Strict Tenant Isolation (STEP 6 & 7A)
  const isTenantValid = authService.validateTenantAccess(requestedTenant);

  if (isTenantValid) {
    return true;
  }

  // Deny access & redirect to login page for the requested tenant
  return router.createUrlTree(['/', requestedTenant, 'login'], {
    queryParams: { returnUrl: state.url, error: 'unauthorized_tenant' }
  });
};
