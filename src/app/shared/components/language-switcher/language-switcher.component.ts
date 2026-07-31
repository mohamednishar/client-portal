import { Component, inject, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, SupportedLang } from '../../../core/services/language.service';

interface BootstrapApi {
  Dropdown: {
    getOrCreateInstance(el: Element): { hide(): void };
  };
}
declare const bootstrap: BootstrapApi;

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dropdown">
      <button
        #dropdownToggle
        class="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1 shadow-sm"
        type="button"
        id="languageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false">
        <i class="bi bi-globe"></i>
        <span class="fw-semibold">{{ currentLang() === 'en' ? 'English' : 'தமிழ்' }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="languageDropdown">
        <li>
          <button
            type="button"
            class="dropdown-item d-flex align-items-center justify-content-between py-2"
            [class.active]="currentLang() === 'en'"
            (click)="selectLanguage('en')">
            <span>English</span>
            <i *ngIf="currentLang() === 'en'" class="bi bi-check-lg text-success ms-2"></i>
          </button>
        </li>
        <li>
          <button
            type="button"
            class="dropdown-item d-flex align-items-center justify-content-between py-2"
            [class.active]="currentLang() === 'ta'"
            (click)="selectLanguage('ta')">
            <span>தமிழ் (Tamil)</span>
            <i *ngIf="currentLang() === 'ta'" class="bi bi-check-lg text-success ms-2"></i>
          </button>
        </li>
      </ul>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private languageService = inject(LanguageService);

  @ViewChild('dropdownToggle') private dropdownToggleRef!: ElementRef;

  public currentLang = this.languageService.currentLang;

  public selectLanguage(lang: SupportedLang): void {
    this.languageService.setLanguage(lang);
    this.closeDropdown();
  }

  private closeDropdown(): void {
    if (this.dropdownToggleRef && typeof bootstrap !== 'undefined') {
      bootstrap.Dropdown.getOrCreateInstance(this.dropdownToggleRef.nativeElement).hide();
    }
  }
}
