import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeOption {
  label: string;
  value: string;
  cssClass: string;
}

export const THEMES: ThemeOption[] = [
  { label: 'Dark', value: 'dark', cssClass: 'dark-theme' },
  { label: 'Light', value: 'light', cssClass: 'light-theme' },
  { label: 'Crimson', value: 'crimson', cssClass: 'crimson-theme' },
  { label: 'Sapphire', value: 'sapphire', cssClass: 'sapphire-theme' }
];

const STORAGE_KEY = 'popout-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<ThemeOption>(THEMES[0]);
  readonly theme$ = this.currentTheme$.asObservable();
  readonly themes = THEMES;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const match = THEMES.find(t => t.value === saved);
    if (match) {
      this.applyTheme(match);
    } else {
      this.applyTheme(THEMES[0]);
    }
  }

  get current(): ThemeOption {
    return this.currentTheme$.value;
  }

  setTheme(theme: ThemeOption): void {
    localStorage.setItem(STORAGE_KEY, theme.value);
    this.applyTheme(theme);
  }

  /** Apply theme class to a specific document (used for popout windows). */
  applyToDocument(doc: Document): void {
    const body = doc.body;
    THEMES.forEach(t => body.classList.remove(t.cssClass));
    body.classList.add(this.current.cssClass);
  }

  private applyTheme(theme: ThemeOption): void {
    THEMES.forEach(t => document.body.classList.remove(t.cssClass));
    document.body.classList.add(theme.cssClass);
    this.currentTheme$.next(theme);
  }
}
