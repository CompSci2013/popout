import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserPreferencesService, ThemeOption, THEMES } from './framework/services/user-preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'popout';
  themes: ThemeOption[] = [];
  selectedTheme: ThemeOption | null = null;

  private themeSub!: Subscription;

  constructor(private userPrefs: UserPreferencesService) {}

  ngOnInit(): void {
    this.themes = this.userPrefs.themes;

    // Subscribe to the user's preferred theme — react whenever it changes.
    this.themeSub = this.userPrefs.theme$.subscribe(theme => {
      this.selectedTheme = theme;
      this.applyThemeToBody(theme);
    });
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }

  onThemeChange(theme: ThemeOption): void {
    // Push the new preference — this triggers the subscription above
    // AND sends a fake API call to persist the choice.
    this.userPrefs.setPreferredTheme(theme);
  }

  /**
   * Swap the body CSS class to activate the chosen theme from themes.scss.
   * This is the same DOM manipulation ThemeService used to do, but now it
   * lives in the component as a side-effect of the RxJS subscription.
   */
  private applyThemeToBody(theme: ThemeOption): void {
    THEMES.forEach(t => document.body.classList.remove(t.cssClass));
    document.body.classList.add(theme.cssClass);
  }
}
