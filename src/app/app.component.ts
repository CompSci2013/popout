import { Component, OnInit } from '@angular/core';
import { ThemeService, ThemeOption } from './framework/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'popout';
  themes: ThemeOption[] = [];
  selectedTheme: ThemeOption | null = null;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themes = this.themeService.themes;
    this.selectedTheme = this.themeService.current;
  }

  onThemeChange(theme: ThemeOption): void {
    this.themeService.setTheme(theme);
  }
}
