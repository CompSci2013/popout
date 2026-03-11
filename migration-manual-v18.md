# Angular Material Migration Manual: v17 → v18

> **What this version changes**: Material Design 3 theming becomes **stable**. This is where you convert your SCSS theming from M2 to M3. HTML templates do not change. The entire design system shifts from compiled SCSS values to CSS custom properties (design tokens).

---

## Step 1: Update Angular and Material

```bash
npx @angular/cli@18 update @angular/core@18 @angular/cli@18 --allow-dirty --force
npx @angular/cli@18 update @angular/material@18 --allow-dirty --force
ng build
```

Your existing M2 theme code **still works** in v18. The M2 functions are renamed with an `m2-` prefix, but the old names continue to work (they're aliases). You can upgrade Angular first, verify the build, then convert to M3 theming at your own pace.

---

## Step 2: Understand What's Changing

### M2 vs M3 — The Key Differences

| Aspect | M2 (what you have) | M3 (what you're converting to) |
|--------|---------------------|-------------------------------|
| **Color model** | primary / accent / warn | primary / secondary / tertiary / error |
| **Palettes** | Numeric hue maps (50, 100, 200...900) | Tonal palettes (auto-generated from seed color) |
| **Theme output** | Compiled SCSS values baked into CSS | CSS custom properties (`--mat-sys-*` design tokens) |
| **Typography** | 13 named levels (headline-1, body-1, etc.) | 15 levels in 5×3 grid (display-large, body-medium, etc.) |
| **Customization** | `::ng-deep` into internal CSS classes | `--mat-*` CSS variables or `mat.*-overrides()` mixins |

### The M3 Color Roles

Instead of picking "hue 500 from indigo palette," M3 uses **semantic color roles**:

| Role | Purpose |
|------|---------|
| `primary` | Main brand color for buttons, links, active states |
| `on-primary` | Text/icons on primary-colored backgrounds |
| `primary-container` | Lighter primary for backgrounds, cards |
| `on-primary-container` | Text on primary-container backgrounds |
| `secondary` | Supporting color (auto-derived from primary) |
| `tertiary` | Accent color (you choose this) |
| `error` | Error states (built-in, you don't configure this) |
| `surface` | Background of cards, dialogs, sheets |
| `on-surface` | Text on surface backgrounds |
| `outline` | Borders, dividers |

The full set includes ~45 roles. You don't need to define them all — M3 generates them from your primary and tertiary palette choices.

---

## Step 3: Convert Your SCSS Themes

### 3.1 Replace `mat.core()`

```scss
// BEFORE (M2)
@include mat.core();

// AFTER (M3 on v18)
@include mat.elevation-classes();
@include mat.app-background();
```

### 3.2 Replace palette definitions

M2 palettes are manually built from hue maps. M3 palettes are pre-built tonal palettes.

```scss
// BEFORE (M2)
$my-primary: mat.define-palette(mat.$indigo-palette, 500, 100, 700);
$my-accent:  mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-warn:    mat.define-palette(mat.$red-palette);

// AFTER (M3) — no define-palette() call. Pass tonal palettes directly to define-theme().
```

Available M3 tonal palettes:

```scss
mat.$red-palette        mat.$green-palette      mat.$blue-palette
mat.$yellow-palette     mat.$cyan-palette       mat.$magenta-palette
mat.$orange-palette     mat.$chartreuse-palette mat.$azure-palette
mat.$violet-palette     mat.$rose-palette       mat.$spring-green-palette
```

To generate a custom palette from a hex color:

```bash
ng generate @angular/material:theme-color
```

> **Note**: Your old M2 palettes (`mat.$indigo-palette`, `mat.$pink-palette`, etc.) are still accessible as `mat.$m2-indigo-palette`, `mat.$m2-pink-palette`, etc. But these produce M2 hue maps, not M3 tonal palettes. Don't use them with `mat.define-theme()`.

### 3.3 Replace theme definitions

```scss
// BEFORE (M2) — separate light/dark functions, primary/accent/warn
$dark-theme: mat.define-dark-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
  typography: $my-typography,
  density: 0,
));

$light-theme: mat.define-light-theme((
  color: (
    primary: $light-primary,
    accent: $light-accent,
    warn: $light-warn,
  ),
  typography: $my-typography,
  density: 0,
));

// AFTER (M3) — unified function, primary/tertiary, theme-type parameter
$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: (
    plain-family: 'Roboto',
    brand-family: 'Roboto',
    bold-weight: 700,
    medium-weight: 500,
    regular-weight: 400,
  ),
  density: (
    scale: 0,
  ),
));

$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
    tertiary: mat.$green-palette,
  ),
  typography: (
    plain-family: 'Roboto',
    brand-family: 'Roboto',
  ),
  density: (
    scale: 0,
  ),
));
```

Key changes:
- `mat.define-dark-theme()` / `mat.define-light-theme()` → `mat.define-theme()` with `theme-type: dark` or `light`
- `primary` / `accent` / `warn` → `primary` / `tertiary` (secondary is auto-derived; error is built-in)
- Typography is now two font families (`plain-family` for body, `brand-family` for headlines) plus weight tiers
- Density is nested under `density: (scale: N)` instead of top-level

### 3.4 Replace theme application

```scss
// BEFORE (M2)
@include mat.all-component-themes($dark-theme);

body.light-theme {
  @include mat.all-component-colors($light-theme);
}

// AFTER (M3) — same mixin name, but now emits CSS custom properties
html {
  @include mat.all-component-themes($dark-theme);
}

body.light-theme {
  @include mat.all-component-themes($light-theme);
}
```

> **Note**: In M2, `all-component-colors()` was an optimization that emitted only color CSS (not typography/density). In M3, because themes emit CSS custom properties, you can use `all-component-themes()` for every theme variant. The CSS custom properties simply override each other — there's no significant size penalty.

### 3.5 Replace color extraction

```scss
// BEFORE (M2) — extract numeric hue from palette
$primary-500: mat.get-color-from-palette($my-primary, 500);
$primary-contrast: mat.get-color-from-palette($my-primary, '500-contrast');

// AFTER (M3) — extract by semantic role from theme
$primary: mat.get-theme-color($theme, primary);
$on-primary: mat.get-theme-color($theme, on-primary);
$surface: mat.get-theme-color($theme, surface);
$on-surface: mat.get-theme-color($theme, on-surface);
$outline: mat.get-theme-color($theme, outline);
$primary-container: mat.get-theme-color($theme, primary-container);
```

Complete list of available color roles:

**Primary group**: `primary`, `on-primary`, `primary-container`, `on-primary-container`, `primary-fixed`, `primary-fixed-dim`, `on-primary-fixed`, `on-primary-fixed-variant`, `inverse-primary`

**Secondary group**: `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`, `secondary-fixed`, `secondary-fixed-dim`, `on-secondary-fixed`, `on-secondary-fixed-variant`

**Tertiary group**: `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container`, `tertiary-fixed`, `tertiary-fixed-dim`, `on-tertiary-fixed`, `on-tertiary-fixed-variant`

**Error group**: `error`, `on-error`, `error-container`, `on-error-container`

**Surface group**: `surface`, `on-surface`, `on-surface-variant`, `surface-bright`, `surface-dim`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`

**Utility**: `outline`, `outline-variant`, `scrim`, `shadow`, `inverse-surface`, `inverse-on-surface`

### 3.6 Replace typography access

```scss
// BEFORE (M2)
$my-typography: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif',
  $headline-1: mat.define-typography-level(112px, 112px, 300),
  $body-1: mat.define-typography-level(16px, 24px, 400),
);

.my-element {
  @include mat.typography-level($my-typography, 'body-1');
  // or:
  font-size: mat.font-size($my-typography, 'body-1');
}

// AFTER (M3) — typography is part of define-theme(), access via get-theme-typography()
.my-element {
  font: mat.get-theme-typography($theme, body-large);
}
```

M2 → M3 typography level mapping:

| M2 Level | M3 Level |
|----------|----------|
| `headline-1` | `display-large` |
| `headline-2` | `display-medium` |
| `headline-3` | `display-small` |
| `headline-4` | `headline-large` |
| `headline-5` | `headline-medium` |
| `headline-6` | `headline-small` |
| `subtitle-1` | `title-medium` |
| `subtitle-2` | `title-small` |
| `body-1` | `body-large` |
| `body-2` | `body-medium` |
| `caption` | `body-small` |
| `button` | `label-large` |
| `overline` | `label-small` |

### 3.7 Replace density configuration

```scss
// BEFORE (M2) — density at top level
$dense-theme: mat.define-light-theme((
  color: (...),
  density: -2,
));

// AFTER (M3) — density nested under 'scale' key
$dense-theme: mat.define-theme((
  color: (...),
  density: (
    scale: -2,
  ),
));
```

Scale is unchanged: 0 to -5, each step = -4px.

### 3.8 Replace light/dark inspection

```scss
// BEFORE (M2)
$color-config: mat.get-color-config($theme);
$is-dark: map.get($color-config, is-dark);

// AFTER (M3)
$type: mat.get-theme-type($theme);   // returns 'light' or 'dark'
```

### 3.9 Update custom component theming

```scss
// BEFORE (M2) — extract palette maps, look up numeric hues
@mixin my-component-theme($theme) {
  $color-config: mat.get-color-config($theme);
  $primary: map.get($color-config, primary);

  .my-component {
    background: mat.get-color-from-palette($primary, 100);
    color: mat.get-color-from-palette($primary, '100-contrast');
  }
}

// AFTER (M3) — use semantic color roles
@mixin my-component-theme($theme) {
  .my-component {
    background: mat.get-theme-color($theme, primary-container);
    color: mat.get-theme-color($theme, on-primary-container);
    border-color: mat.get-theme-color($theme, outline);
  }

  .my-component-title {
    font: mat.get-theme-typography($theme, title-medium);
  }
}
```

### 3.10 Bridge CSS custom properties to your existing variables

If your components already use CSS custom properties (like `--theme-table-header-bg`), you can bridge them to M3's design tokens:

```scss
body.dark-theme {
  // M3 design tokens are auto-generated by all-component-themes()
  // Bridge your custom variables to them:
  --theme-table-header-bg: #{mat.get-theme-color($dark-theme, surface-container)};
  --theme-table-header-text: #{mat.get-theme-color($dark-theme, on-surface)};
  --theme-table-row-bg: #{mat.get-theme-color($dark-theme, surface)};
  --theme-table-row-hover-bg: #{mat.get-theme-color($dark-theme, surface-container-high)};
  --theme-text-primary: #{mat.get-theme-color($dark-theme, on-surface)};
  --theme-text-muted: #{mat.get-theme-color($dark-theme, on-surface-variant)};
  --theme-border: #{mat.get-theme-color($dark-theme, outline-variant)};
}
```

This lets you migrate incrementally — bridge first, then later convert to direct `--mat-sys-*` usage.

---

## Step 4: Use Component-Level Overrides (New in v18)

M3 introduces `*-overrides()` mixins for fine-tuning individual component tokens without `::ng-deep`:

```scss
// Override dialog padding globally
:root {
  @include mat.dialog-overrides((
    content-padding: 3rem,
  ));
}

// Override button text style in a section
.uppercase-buttons {
  @include mat.button-overrides((
    filled-label-text-transform: uppercase,
    outlined-label-text-transform: uppercase,
  ));
}

// Override card appearance
.custom-card {
  @include mat.card-overrides((
    container-color: #f5f5f5,
    title-text-size: 20px,
  ));
}
```

These validate token names at compile time — typos produce build errors, not silent failures.

### System-level token overrides

Override `--mat-sys-*` tokens within a scope, affecting all Material components inside:

```scss
.branded-section {
  @include mat.theme-overrides((
    primary: #1a237e,
    on-primary: #ffffff,
    surface: #fafafa,
  ));
}
```

---

## Step 5: Use CSS Design Tokens Directly (Optional)

M3 themes emit CSS custom properties that you can use anywhere — not just in SCSS:

```scss
// These tokens are automatically generated by mat.all-component-themes()
.my-header {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}

.my-sidebar {
  background: var(--mat-sys-surface-container);
  border-right: 1px solid var(--mat-sys-outline-variant);
}
```

**Color tokens**: `--mat-sys-primary`, `--mat-sys-on-primary`, `--mat-sys-surface`, `--mat-sys-on-surface`, `--mat-sys-outline`, etc.

**Typography tokens**: `--mat-sys-display-large`, `--mat-sys-body-medium`, `--mat-sys-label-large`, etc. Each also has sub-tokens: `--mat-sys-body-large-font`, `--mat-sys-body-large-size`, `--mat-sys-body-large-weight`, `--mat-sys-body-large-line-height`, `--mat-sys-body-large-tracking`.

**Elevation tokens**: `--mat-sys-level0` through `--mat-sys-level5`.

**Shape tokens**: `--mat-sys-corner-extra-small`, `--mat-sys-corner-small`, `--mat-sys-corner-medium`, `--mat-sys-corner-large`, `--mat-sys-corner-extra-large`, `--mat-sys-corner-full`.

**Component tokens**: Each component also emits its own tokens, e.g., `--mat-filled-button-container-color`, `--mat-card-container-color`, `--mat-dialog-container-color`.

---

## HTML Templates — No Changes

There are no template changes in v18. All template selectors and directives are identical to v17.

The only new template-relevant feature is the `appearance` input on `<mat-card>`:

```html
<!-- New optional input — not required -->
<mat-card appearance="outlined">...</mat-card>   <!-- M3 outlined style -->
<mat-card appearance="raised">...</mat-card>     <!-- M3 raised style (default) -->
```

This is additive — your existing card templates work without modification.

---

## Complete SCSS Function/Mixin Migration Reference

### Functions renamed with `m2-` prefix

The old names still work as aliases in v18. But know the canonical names:

| v17 name | v18 canonical name | M3 replacement |
|----------|-------------------|----------------|
| `mat.define-palette()` | `mat.m2-define-palette()` | N/A (use pre-built tonal palettes) |
| `mat.define-light-theme()` | `mat.m2-define-light-theme()` | `mat.define-theme()` with `theme-type: light` |
| `mat.define-dark-theme()` | `mat.m2-define-dark-theme()` | `mat.define-theme()` with `theme-type: dark` |
| `mat.define-typography-config()` | `mat.m2-define-typography-config()` | Typography map in `define-theme()` |
| `mat.define-typography-level()` | `mat.m2-define-typography-level()` | N/A (M3 type scale is automatic) |
| `mat.get-color-from-palette()` | `mat.m2-get-color-from-palette()` | `mat.get-theme-color($theme, role)` |
| `mat.$indigo-palette` | `mat.$m2-indigo-palette` | `mat.$azure-palette` or `mat.$violet-palette` |
| `mat.$pink-palette` | `mat.$m2-pink-palette` | `mat.$rose-palette` |

### Functions removed

| Removed | Replacement |
|---------|-------------|
| `mat.get-color-config()` | `mat.get-theme-color()` |
| `mat.get-typography-config()` | `mat.get-theme-typography()` |
| `mat.font-family()` | `mat.get-theme-typography()` |
| `mat.font-size()` | `mat.get-theme-typography()` |
| `mat.font-weight()` | `mat.get-theme-typography()` |
| `mat.line-height()` | `mat.get-theme-typography()` |
| `mat.letter-spacing()` | `mat.get-theme-typography()` |
| `mat.typography-level()` | `mat.get-theme-typography()` |

### New functions and mixins

| New in v18 | Purpose |
|------------|---------|
| `mat.define-theme(config)` | Create an M3 theme object |
| `mat.get-theme-color($theme, role)` | Get color by semantic role |
| `mat.get-theme-color($theme, role, tone)` | Get color by role + tone (0-100) |
| `mat.get-theme-type($theme)` | Returns `'light'` or `'dark'` |
| `mat.get-theme-typography($theme, level)` | Get typography shorthand |
| `mat.get-theme-density($theme)` | Get density scale value |
| `mat.elevation-classes()` | Replaces part of `mat.core()` |
| `mat.app-background()` | Replaces part of `mat.core()` |
| `mat.system-level-colors($theme)` | Emit `--mat-sys-*` color tokens |
| `mat.system-level-typography($theme)` | Emit `--mat-sys-*` typography tokens |
| `mat.theme-overrides(tokens)` | Override system tokens in a scope |
| `mat.<component>-overrides(tokens)` | Override component tokens |

---

## Complete Conversion Example

### Before (M2 themes.scss)

```scss
@use '@angular/material' as mat;

$popout-typography: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif'
);

$dark-primary: mat.define-palette(mat.$blue-grey-palette, 700, 300, 900);
$dark-accent:  mat.define-palette(mat.$light-blue-palette, A200, A100, A400);
$dark-warn:    mat.define-palette(mat.$red-palette);
$dark-theme: mat.define-dark-theme((
  color: (primary: $dark-primary, accent: $dark-accent, warn: $dark-warn),
  typography: $popout-typography,
  density: 0,
));

$light-primary: mat.define-palette(mat.$indigo-palette, 500, 100, 700);
$light-accent:  mat.define-palette(mat.$pink-palette, A200, A100, A400);
$light-warn:    mat.define-palette(mat.$red-palette);
$light-theme: mat.define-light-theme((
  color: (primary: $light-primary, accent: $light-accent, warn: $light-warn),
  typography: $popout-typography,
  density: 0,
));

@include mat.core();
@include mat.all-component-themes($dark-theme);

body.light-theme {
  @include mat.all-component-colors($light-theme);
}

body.dark-theme {
  --theme-table-header-bg: #{mat.get-color-from-palette($dark-primary, 700)};
  --theme-text-primary: #e0e0e0;
}
body.light-theme {
  --theme-table-header-bg: #{mat.get-color-from-palette($light-primary, 100)};
  --theme-text-primary: #333333;
}
```

### After (M3 themes.scss)

```scss
@use '@angular/material' as mat;

@include mat.elevation-classes();
@include mat.app-background();

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

$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,
    tertiary: mat.$rose-palette,
  ),
  typography: (
    plain-family: 'Roboto',
    brand-family: 'Roboto',
  ),
  density: (
    scale: 0,
  ),
));

html {
  @include mat.all-component-themes($dark-theme);
}

body.light-theme {
  @include mat.all-component-themes($light-theme);
}

body.dark-theme {
  --theme-table-header-bg: #{mat.get-theme-color($dark-theme, surface-container)};
  --theme-text-primary: #{mat.get-theme-color($dark-theme, on-surface)};
}
body.light-theme {
  --theme-table-header-bg: #{mat.get-theme-color($light-theme, surface-container)};
  --theme-text-primary: #{mat.get-theme-color($light-theme, on-surface)};
}
```

---

## Checklist

- [ ] Run `ng update` for Angular core and Material
- [ ] Verify build passes with existing M2 theme code (it should — M2 still works)
- [ ] Replace `mat.core()` with `mat.elevation-classes()` + `mat.app-background()`
- [ ] Replace `mat.define-palette()` calls with M3 tonal palette references
- [ ] Replace `mat.define-light-theme()` / `mat.define-dark-theme()` with `mat.define-theme()`
- [ ] Convert `primary/accent/warn` to `primary/tertiary` with `theme-type` parameter
- [ ] Convert typography from `define-typography-config()` to the `typography` map in `define-theme()`
- [ ] Replace `mat.get-color-from-palette($palette, hue)` with `mat.get-theme-color($theme, role)`
- [ ] Replace `mat.typography-level()` / `mat.font-size()` etc. with `mat.get-theme-typography()`
- [ ] Replace `mat.get-color-config()` with `mat.get-theme-type()` or `mat.get-theme-color()`
- [ ] Update custom component theming mixins to use semantic roles
- [ ] Bridge existing CSS custom properties to M3 `mat.get-theme-color()` values
- [ ] Optionally use `mat.*-overrides()` mixins for component-level customization
- [ ] Run `ng build` and verify no errors
- [ ] Visually test all themes
