import { Injectable, signal } from '@angular/core';
import { ClientTheme } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public activeTheme = signal<ClientTheme | null>(null);

  public applyTheme(theme: ClientTheme): void {
    this.activeTheme.set(theme);

    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor || '#0d6efd');
    root.style.setProperty('--secondary-color', theme.secondaryColor || '#0b5ed7');
    root.style.setProperty('--accent-color', theme.accentColor || '#6ea8fe');
    root.style.setProperty('--bg-color', theme.backgroundColor || '#f8f9fa');
    root.style.setProperty('--header-bg', theme.headerBg || theme.primaryColor || '#0d6efd');

    root.style.setProperty('--primary-rgb', this.hexToRgb(theme.primaryColor || '#0d6efd'));
  }

  private hexToRgb(hex: string): string {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r}, ${g}, ${b}`;
  }
}
