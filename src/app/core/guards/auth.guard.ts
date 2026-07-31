import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { APP_ROUTES } from '../constants/routes.constants';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // The route tenant is authoritative and always comes from the URL.
  const routeTenant =
    route.paramMap.get('clientId') ||
    route.parent?.paramMap.get('clientId') ||
    APP_ROUTES.DEFAULT_CLIENT_ID;

  // Allow only when BOTH conditions hold:
  //   1. A valid token/session exists
  //   2. The logged-in tenant matches the requested route tenant
  if (authService.isLoggedIn() && authService.getCurrentTenant() === routeTenant) {
    return true;
  }

  // Deny access and redirect to the ROUTE tenant's login page.
  // Authentication from any other tenant is never reused across tenants.
  return router.createUrlTree(['/', routeTenant, APP_ROUTES.LOGIN], {
    queryParams: { returnUrl: state.url }
  });
};
