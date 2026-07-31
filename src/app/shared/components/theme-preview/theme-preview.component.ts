import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ClientTheme } from '../../../core/models/client.model';

@Component({
  selector: 'app-theme-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-preview.component.html'
})
export class ThemePreviewComponent {
  @Input({ required: true }) theme!: ClientTheme;
}
