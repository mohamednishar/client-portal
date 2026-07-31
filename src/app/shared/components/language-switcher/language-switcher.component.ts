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
  templateUrl: './language-switcher.component.html'
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
