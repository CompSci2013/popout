# Angular Material Migration Manual: v18 → v19

> **What this version changes**: The M3 theming API is simplified. `mat.define-theme()` + `mat.all-component-themes()` is replaced by a single `mat.theme()` mixin. SCSS theme inspection functions give way to direct CSS variable usage. One new component added (Timepicker). A CSS variable prefix changes.

---

## Step 1: Update Angular and Material

```bash
npx @angular/cli@19 update @angular/core@19 @angular/cli@19 --allow-dirty --force
npx @angular/cli@19 update @angular/material@19 --allow-dirty --force
ng build
```

Your existing v18 M3 theme code still works in v19. The v18 API is deprecated but not removed. You can upgrade first and convert at your own pace.

---

## Step 2: Convert SCSS Themes

### 2.1 Replace `mat.define-theme()` + `mat.all-component-themes()` with `mat.theme()`

In v18, you defined a theme variable and then applied it. In v19, `mat.theme()` is a mixin that does both at once:

```scss
// BEFORE (v18)
$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    plain-family: 'Roboto',
    brand-family: 'Roboto',
  ),
  density: (
    scale: 0,
  ),
));

@include mat.elevation-classes();
@include mat.app-background();

html {
  @include mat.all-component-themes($dark-theme);
}

// AFTER (v19)
html {
  @include mat.theme((
    color: (
      theme-type: dark,
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

**What changed**:
- `mat.define-theme()` (function that returns a theme object) → `mat.theme()` (mixin that directly emits CSS)
- No separate `$theme` variable needed
- `mat.elevation-classes()` and `mat.app-background()` are no longer needed — `mat.theme()` handles them
- Typography simplified: just a font family string (or a map for granular control)
- Density simplified: just a number, not `(scale: N)`

### 2.2 Replace theme switching

```scss
// BEFORE (v18)
$dark-theme: mat.define-theme((
  color: (theme-type: dark, primary: mat.$azure-palette, tertiary: mat.$blue-palette),
  typography: (plain-family: 'Roboto', brand-family: 'Roboto'),
  density: (scale: 0),
));

$light-theme: mat.define-theme((
  color: (theme-type: light, primary: mat.$violet-palette, tertiary: mat.$rose-palette),
  typography: (plain-family: 'Roboto', brand-family: 'Roboto'),
  density: (scale: 0),
));

html {
  @include mat.all-component-themes($dark-theme);
}
body.light-theme {
  @include mat.all-component-themes($light-theme);
}

// AFTER (v19) — Option A: body class approach
html {
  @include mat.theme((
    color: (theme-type: dark, primary: mat.$azure-palette, tertiary: mat.$blue-palette),
    typography: Roboto,
    density: 0,
  ));
}
body.light-theme {
  @include mat.theme((
    color: (theme-type: light, primary: mat.$violet-palette, tertiary: mat.$rose-palette),
    typography: Roboto,
    density: 0,
  ));
}

// AFTER (v19) — Option B: color-scheme approach (simpler if same palettes for light/dark)
html {
  @include mat.theme((
    color: mat.$azure-palette,    // auto light/dark via color-scheme
    typography: Roboto,
    density: 0,
  ));
}
body.dark-mode {
  color-scheme: dark;             // just flip this — all M3 tokens adjust automatically
}
```

**Option B** is dramatically simpler when your light and dark themes use the same palettes. The `color-scheme` approach uses CSS's `light-dark()` function under the hood — M3 generates both light and dark token values, and the browser picks the right one based on `color-scheme`.

### 2.3 Replace SCSS theme inspection with CSS variables

```scss
// BEFORE (v18) — SCSS function to extract color
.my-element {
  background: mat.get-theme-color($theme, primary);
  color: mat.get-theme-color($theme, on-primary);
  font: mat.get-theme-typography($theme, body-large);
}

// AFTER (v19) — CSS custom properties (preferred)
.my-element {
  background: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
  font: var(--mat-sys-body-large);
}
```

The SCSS functions still work in v19, but CSS variables are the recommended approach. Benefits:
- No `$theme` variable needed
- Works in plain CSS files, not just SCSS
- Works at runtime (no rebuild needed for overrides)
- Shorter, more readable

### 2.4 Replace per-component theme mixins with overrides

```scss
// BEFORE (v18)
.custom-section {
  @include mat.button-theme($theme);
  @include mat.card-theme($theme);
}

// AFTER (v19) — per-component theme mixins are deprecated
// Use -overrides() for component-specific customization:
.custom-section {
  @include mat.button-overrides((
    filled-container-color: #1a237e,
    filled-label-text-color: #ffffff,
  ));
  @include mat.card-overrides((
    container-color: #f5f5f5,
  ));
}
```

### 2.5 Remove v18-only intermediate mixins

```scss
// BEFORE (v18) — these were bridges from mat.core()
@include mat.elevation-classes();
@include mat.app-background();
@include mat.system-level-colors($theme);
@include mat.system-level-typography($theme);

// AFTER (v19) — all handled by mat.theme()
// Delete all four lines. mat.theme() subsumes them.
```

---

## Step 3: Fix CSS Variable Prefix

The system-level CSS variable prefix changed:

```
v18:  --sys-*
v19:  --mat-sys-*
```

If you reference `--sys-*` variables anywhere in your SCSS or CSS, update them:

```bash
# Find all --sys- references (excluding --mat-sys- which is already correct)
grep -r "\-\-sys-" src/ --include="*.scss" --include="*.css" | grep -v "\-\-mat-sys-"
```

```scss
// BEFORE (v18)
.my-element {
  color: var(--sys-primary);
  background: var(--sys-surface);
}

// AFTER (v19)
.my-element {
  color: var(--mat-sys-primary);
  background: var(--mat-sys-surface);
}
```

---

## Step 4: HTML Template Changes

### 4.1 Timepicker (new component)

v19 adds a new `<mat-timepicker>` component. It didn't exist before — this is additive, not a migration.

```html
<mat-form-field>
  <mat-label>Select time</mat-label>
  <input matInput [matTimepicker]="picker" [(ngModel)]="selectedTime">
  <mat-timepicker-toggle matIconSuffix [for]="picker"></mat-timepicker-toggle>
  <mat-timepicker #picker [interval]="30"></mat-timepicker>
</mat-form-field>
```

Use it if you need time input. Ignore it otherwise.

### 4.2 No other template changes

All existing template selectors and directives from v18 continue to work unchanged.

---

## Step 5: Handle Removed Symbols

A few deprecated symbols were cleaned up in v19:

| Removed | Notes |
|---------|-------|
| `MAT_STEPPER_INTL_PROVIDER` | Stepper internationalization provider factory |
| `MAT_STEPPER_INTL_PROVIDER_FACTORY` | Stepper internationalization |
| `MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY` | Button toggle default options |
| `matBottomSheet` animations symbol | Bottom sheet animations |

If your code references any of these, remove the references.

---

## Step 6: Optional — Use Utility Classes

v19 provides optional utility classes:

```scss
@include mat.system-classes();
```

This generates classes you can use directly in HTML:

```html
<div class="mat-bg-primary mat-text-on-primary">Primary section</div>
<p class="mat-font-body-lg">Body large text</p>
<h1 class="mat-font-headline-md">Medium headline</h1>
<div class="mat-bg-surface mat-text-on-surface">Surface section</div>
```

Available classes:
- `mat-bg-primary`, `mat-bg-surface`, `mat-bg-primary-container`, etc.
- `mat-text-on-surface`, `mat-text-primary`, `mat-text-on-primary`, etc.
- `mat-font-body-lg`, `mat-font-headline-md`, `mat-font-display-sm`, etc.

This is optional — add it if you want convenience classes.

---

## Complete v18 → v19 Migration Reference

| v18 Pattern | v19 Replacement |
|-------------|-----------------|
| `$theme: mat.define-theme((...))` | Remove — no variable needed |
| `@include mat.all-component-themes($theme)` | `@include mat.theme((...))` |
| `@include mat.all-component-colors($theme)` | `@include mat.theme((...))` |
| `@include mat.elevation-classes()` | Remove (handled by `mat.theme()`) |
| `@include mat.app-background()` | Remove (handled by `mat.theme()`) |
| `@include mat.system-level-colors($theme)` | Remove (handled by `mat.theme()`) |
| `@include mat.system-level-typography($theme)` | Remove (handled by `mat.theme()`) |
| `mat.get-theme-color($theme, primary)` | `var(--mat-sys-primary)` |
| `mat.get-theme-color($theme, on-primary)` | `var(--mat-sys-on-primary)` |
| `mat.get-theme-color($theme, surface)` | `var(--mat-sys-surface)` |
| `mat.get-theme-typography($theme, body-large)` | `var(--mat-sys-body-large)` |
| `@include mat.button-theme($theme)` | `@include mat.button-overrides((...))` |
| `@include mat.card-theme($theme)` | `@include mat.card-overrides((...))` |
| `typography: (plain-family: 'Roboto', brand-family: 'Roboto')` | `typography: Roboto` |
| `density: (scale: 0)` | `density: 0` |
| `--sys-primary` | `--mat-sys-primary` |
| Body class + re-emit full theme for dark mode | `color-scheme: dark` on ancestor (if same palettes) |

---

## Available CSS Design Tokens (Complete Reference)

All tokens are prefixed with `--mat-sys-` in v19.

**Color tokens**:
`primary`, `on-primary`, `primary-container`, `on-primary-container`,
`secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`,
`tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container`,
`error`, `on-error`, `error-container`, `on-error-container`,
`surface`, `on-surface`, `on-surface-variant`,
`surface-bright`, `surface-dim`,
`surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`,
`outline`, `outline-variant`,
`inverse-surface`, `inverse-on-surface`, `inverse-primary`,
`scrim`, `shadow`

**Typography tokens** (each has `-font`, `-size`, `-weight`, `-line-height`, `-tracking` sub-tokens):
`display-large`, `display-medium`, `display-small`,
`headline-large`, `headline-medium`, `headline-small`,
`title-large`, `title-medium`, `title-small`,
`body-large`, `body-medium`, `body-small`,
`label-large`, `label-medium`, `label-small`

**Elevation tokens**: `level0` through `level5`

**Shape tokens**: `corner-extra-small`, `corner-small`, `corner-medium`, `corner-large`, `corner-extra-large`, `corner-full`

**State tokens**: `hover-state-layer-opacity`, `focus-state-layer-opacity`, `pressed-state-layer-opacity`, `dragged-state-layer-opacity`

---

## Checklist

- [ ] Run `ng update` for Angular core and Material
- [ ] Verify build passes with existing v18 M3 code
- [ ] Replace `mat.define-theme()` + `mat.all-component-themes()` with `mat.theme()`
- [ ] Remove `mat.elevation-classes()`, `mat.app-background()`, `mat.system-level-colors()`, `mat.system-level-typography()`
- [ ] Simplify typography config (font family string) and density config (flat number)
- [ ] Replace `mat.get-theme-color($theme, role)` with `var(--mat-sys-role)` where practical
- [ ] Replace `mat.get-theme-typography($theme, level)` with `var(--mat-sys-level)` where practical
- [ ] Replace per-component `-theme()` mixins with `-overrides()` mixins
- [ ] Find-and-replace `--sys-` with `--mat-sys-` in all stylesheets
- [ ] Remove references to deleted symbols (`MAT_STEPPER_INTL_PROVIDER`, etc.)
- [ ] Optionally adopt `color-scheme` approach for light/dark switching
- [ ] Optionally add `@include mat.system-classes()` for utility classes
- [ ] Run `ng build` and verify no errors
- [ ] Visually test all themes
