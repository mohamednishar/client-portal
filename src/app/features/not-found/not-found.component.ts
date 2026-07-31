import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-5 text-center">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card card-theme p-5 border-0 shadow-lg">
            <div class="display-1 fw-bold text-client-primary mb-3">404</div>
            <h3 class="fw-bold text-dark mb-2">{{ 'ERRORS.NOT_FOUND_TITLE' | translate }}</h3>
            <p class="text-muted mb-4">{{ 'ERRORS.NOT_FOUND_MSG' | translate }}</p>
            <div>
              <a [routerLink]="['/', clientId(), 'login']" class="btn btn-client-primary btn-lg px-4 shadow-sm fw-bold">
                <i class="bi bi-house-door-fill me-2"></i>
                <span>{{ 'ERRORS.BACK_TO_LOGIN' | translate }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  private clientService = inject(ClientService);
  public clientId = () => this.clientService.getClientId() || 'client-a';
}
