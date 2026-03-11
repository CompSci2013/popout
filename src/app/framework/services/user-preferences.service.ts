import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Available themes — mirrors the CSS classes defined in themes.scss.
 * No ThemeService dependency; the mapping lives here as plain data.
 */
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

const API_URL = 'assets/user-preferences.json';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private preferredTheme$ = new BehaviorSubject<ThemeOption>(THEMES[0]);

  /** Observable that any component can subscribe to for the current theme. */
  readonly theme$: Observable<ThemeOption> = this.preferredTheme$.asObservable();

  /** Full list of available themes — for populating dropdowns. */
  readonly themes: ThemeOption[] = THEMES;

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  /** Current snapshot — useful for one-time reads (e.g., popout window init). */
  get current(): ThemeOption {
    return this.preferredTheme$.value;
  }

  /**
   * Called when the user picks a new theme from the dropdown.
   * Pushes the new value through the BehaviorSubject (subscribers react)
   * and persists the choice via a fake REST API call.
   */
  setPreferredTheme(theme: ThemeOption): void {
    this.preferredTheme$.next(theme);
    this.savePreferences(theme.value);
  }

  // ---------------------------------------------------------------------------
  // Fake REST API — reads/writes a local JSON asset.
  //
  // In production, these would be real HTTP calls:
  //   GET  /api/user/preferences
  //   PUT  /api/user/preferences  { preferredTheme: "dark" }
  //
  // Because Angular's dev server serves assets read-only, the PUT is simulated
  // with a console log. The GET works normally via HttpClient.
  // ---------------------------------------------------------------------------

  private loadPreferences(): void {
    this.http.get<{ preferredTheme: string }>(API_URL).subscribe({
      next: (prefs) => {
        const match = THEMES.find(t => t.value === prefs.preferredTheme);
        if (match) {
          this.preferredTheme$.next(match);
        }
      },
      error: () => {
        // First run or missing file — default theme already set via BehaviorSubject seed.
      }
    });
  }

  private savePreferences(themeValue: string): void {
    // Simulate PUT /api/user/preferences
    // A real app would do: this.http.put(API_URL, { preferredTheme: themeValue }).subscribe();
    console.log(
      `[UserPreferencesService] PUT ${API_URL}`,
      JSON.stringify({ preferredTheme: themeValue })
    );
  }
}
