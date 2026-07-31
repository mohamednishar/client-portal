import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ClientService } from '../services/client.service';
import { STORAGE_KEYS } from '../constants/storage.keys';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const clientService = inject(ClientService);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Get current clientId parameter from parent or current route
  const clientId = route.paramMap.get('clientId') || 
                   route.parent?.paramMap.get('clientId') || 
                   clientService.getClientId() || 
                   'client-a';

  // Redirect to login page for active client
  return router.createUrlTree(['/', clientId, 'login'], {
    queryParams: { returnUrl: state.url }
  });
};
