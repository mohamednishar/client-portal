import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientService } from '../../../../core/services/client.service';
import { ThemePreviewComponent } from '../../../../shared/components/theme-preview/theme-preview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ThemePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private clientService = inject(ClientService);

  public currentUser = this.authService.currentUserSignal;
  public currentRole = this.authService.currentRoleSignal;
  public isSuperAdmin = () => this.authService.isSuperAdmin();

  public clientId = () => this.clientService.getClientId() || 'client-a';
  public clientName = () => this.clientService.getClientName();
  public clientTheme = () => this.clientService.currentClientSignal()?.theme;
  public departments = () => this.clientService.getDepartments();

  public totalUsersCount = computed(() => this.clientService.getUsers().length);
  public totalDeptsCount = computed(() => this.clientService.getDepartments().length);
}
