import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ClientTheme } from '../../../core/models/client.model';

@Component({
  selector: 'app-theme-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card card-theme h-100 p-3">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h6 class="fw-bold m-0 text-muted">
          <i class="bi bi-palette me-2 text-client-primary"></i>
          {{ 'DASHBOARD.THEME_SWATCH' | translate }}
        </h6>
        <span class="badge badge-client rounded-pill text-uppercase">CSS Variables</span>
      </div>

      <div class="row g-2 text-center" *ngIf="theme">
        <div class="col-6">
          <div class="p-2 rounded text-white fw-medium shadow-sm" [style.backgroundColor]="theme.primaryColor">
            Primary
            <div class="small opacity-75">{{ theme.primaryColor }}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="p-2 rounded text-white fw-medium shadow-sm" [style.backgroundColor]="theme.secondaryColor">
            Secondary
            <div class="small opacity-75">{{ theme.secondaryColor }}</div>
          </div>
        </div>
        <div class="col-12 mt-2">
          <div class="p-2 rounded text-dark fw-medium shadow-sm" [style.backgroundColor]="theme.accentColor">
            Accent Highlight
            <div class="small opacity-75">{{ theme.accentColor }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ThemePreviewComponent {
  @Input({ required: true }) theme!: ClientTheme;
}
