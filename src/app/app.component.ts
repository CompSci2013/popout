import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from './framework/services/user-preferences.service';
import { ThemeOption, THEMES, DEFAULT_THEME } from './framework/constants/theme.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'popout';
  themes: ThemeOption[] = THEMES;
  selectedTheme: ThemeOption = DEFAULT_THEME;

  private themeSub!: Subscription;

  constructor(private userPrefs: UserPreferencesService) {}

  ngOnInit(): void {
    // Subscribe to the raw "theme" preference string and translate it
    // into a ThemeOption. The preferences service returns plain strings —
    // this component owns the mapping to CSS classes and labels.
    this.themeSub = this.userPrefs.getPreference$('theme').subscribe(themeValue => {
      const match = THEMES.find(t => t.value === themeValue);
      const theme = match || DEFAULT_THEME;
      this.selectedTheme = theme;
      this.applyThemeToBody(theme);
    });
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }

  onThemeChange(theme: ThemeOption): void {
    // Persist the raw string value — the subscription above reacts and applies it.
    this.userPrefs.setPreference('theme', theme.value);
  }

  private applyThemeToBody(theme: ThemeOption): void {
    THEMES.forEach(t => document.body.classList.remove(t.cssClass));
    document.body.classList.add(theme.cssClass);
  }
}
