import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, SupportedLang } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dropdown">
      <button 
        class="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1 shadow-sm" 
        type="button" 
        id="languageDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false">
        <i class="bi bi-globe"></i>
        <span class="fw-semibold text-uppercase">{{ currentLang() }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="languageDropdown">
        <li>
          <button 
            class="dropdown-item d-flex align-items-center justify-content-between py-2" 
            [class.active]="currentLang() === 'en'"
            (click)="selectLanguage('en')">
            <span>English</span>
            <span class="badge bg-secondary rounded-pill">EN</span>
          </button>
        </li>
        <li>
          <button 
            class="dropdown-item d-flex align-items-center justify-content-between py-2" 
            [class.active]="currentLang() === 'ta'"
            (click)="selectLanguage('ta')">
            <span>தமிழ் (Tamil)</span>
            <span class="badge bg-secondary rounded-pill">TA</span>
          </button>
        </li>
      </ul>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private languageService = inject(LanguageService);
  public currentLang = this.languageService.currentLang;

  public selectLanguage(lang: SupportedLang): void {
    this.languageService.setLanguage(lang);
  }
}
