import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ClientService } from '../services/client.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const clientGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const clientService = inject(ClientService);
  const router = inject(Router);

  const clientId = route.paramMap.get('clientId') || 'client-a';
  const currentLoaded = clientService.currentClientSignal();

  if (currentLoaded && currentLoaded.clientId === clientId) {
    return true;
  }

  return clientService.loadClientConfig(clientId).pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(['/client-a/login']));
    })
  );
};
