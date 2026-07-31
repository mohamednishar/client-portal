import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage.keys';

export type SupportedLang = 'en' | 'ta';

export const SUPPORTED_LANGS: SupportedLang[] = ['en', 'ta'];

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private storageService = inject(StorageService);

  public currentLang = signal<SupportedLang>('en');

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    this.translate.addLangs(SUPPORTED_LANGS);
    this.translate.setDefaultLang('en');

    const savedLang = this.storageService.getItem(STORAGE_KEYS.SELECTED_LANG) as SupportedLang;
    const initialLang =
      savedLang && SUPPORTED_LANGS.includes(savedLang) ? savedLang : 'en';

    this.setLanguage(initialLang);
  }

  /**
   * Switches the active language, persists it and updates the UI immediately.
   */
  public setLanguage(lang: SupportedLang): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    this.storageService.setItem(STORAGE_KEYS.SELECTED_LANG, lang);
    document.documentElement.lang = lang;
  }

  public toggleLanguage(): void {
    const nextLang: SupportedLang = this.currentLang() === 'en' ? 'ta' : 'en';
    this.setLanguage(nextLang);
  }

  public getCurrentLang(): SupportedLang {
    return this.currentLang();
  }

  public isActiveLang(lang: SupportedLang): boolean {
    return this.currentLang() === lang;
  }
}
