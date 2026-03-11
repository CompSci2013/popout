/**
 * Theme constants — the mapping between theme value strings and CSS classes.
 * Shared between AppComponent (dropdown + body class) and PopOutManagerService
 * (popout window theming). The UserPreferencesService never imports this.
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

export const DEFAULT_THEME = THEMES[0];
