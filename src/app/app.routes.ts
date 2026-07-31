import { Routes } from '@angular/router';
import { clientGuard } from './core/guards/client.guard';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'client-a/login',
    pathMatch: 'full'
  },
  {
    path: ':clientId',
    component: MainLayoutComponent,
    canActivate: [clientGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
        data: { animation: 'LoginPage' }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        data: { animation: 'DashboardPage' }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [authGuard],
        data: { animation: 'UsersPage' }
      },
      {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
        data: { animation: 'NotFoundPage' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'client-a/login'
  }
];
