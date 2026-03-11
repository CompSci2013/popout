# Angular Material SCSS Theming API: M2 to M3 Conversion Reference

> **Scope**: Angular Material v14/v15 (M2) to v18 (M3 stable) and v19 (M3 simplified).
> This document covers every `mat.*` SCSS function and mixin that changes, with before/after code and rationale.

---

## Table of Contents

1. [Conceptual Overview](#1-conceptual-overview)
2. [Import Statement](#2-import-statement)
3. [`mat.core()` Mixin](#3-matcore-mixin)
4. [Palette Definition](#4-palette-definition)
5. [Pre-built Palettes](#5-pre-built-palettes)
6. [Theme Definition](#6-theme-definition)
7. [Applying Themes to All Components](#7-applying-themes-to-all-components)
8. [Individual Component Theme Mixins](#8-individual-component-theme-mixins)
9. [Color System: Roles and Retrieval](#9-color-system-roles-and-retrieval)
10. [Typography Configuration](#10-typography-configuration)
11. [Typography Level Access](#11-typography-level-access)
12. [Density Configuration](#12-density-configuration)
13. [Theme Type Inspection (Light/Dark)](#13-theme-type-inspection-lightdark)
14. [Theme Switching (Light/Dark Mode)](#14-theme-switching-lightdark-mode)
15. [CSS Custom Properties / Design Tokens](#15-css-custom-properties--design-tokens)
16. [System-Level Mixins (v18 only)](#16-system-level-mixins-v18-only)
17. [Component-Level Overrides](#17-component-level-overrides)
18. [System Token Overrides](#18-system-token-overrides)
19. [Strong Focus Indicators](#19-strong-focus-indicators)
20. [Custom Component Theming](#20-custom-component-theming)
21. [Complete Function/Mixin Rename Table](#21-complete-functionmixin-rename-table)
22. [v18 to v19 Migration Notes](#22-v18-to-v19-migration-notes)

---

## 1. Conceptual Overview

| Aspect | M2 (v14/v15) | M3 (v18+) |
|--------|--------------|-----------|
| **Design system** | Material Design 2 | Material Design 3 |
| **Color model** | Primary / Accent / Warn with numeric hues (50-900) | Primary / Secondary / Tertiary / Error with semantic roles |
| **Palette type** | Fixed hue maps (e.g., 50, 100, 200...A700) | Tonal palettes (0-100 tone scale, auto-generated) |
| **Theming output** | Compiled SCSS values baked into CSS | CSS custom properties (design tokens) |
| **Typography** | Named levels (headline-1, body-1, etc.) | M3 type scale (display-large, body-medium, etc.) |
| **Density** | Scale from 0 to -5 | Same (0 to -5, each step = -4px) |

**Why the change**: M3 uses a token-based architecture. Instead of baking color values directly into component CSS at build time, M3 emits CSS custom properties (`--mat-sys-*`). This enables runtime theme switching, better dark mode support, and cleaner customization without deep SCSS knowledge.

---

## 2. Import Statement

The import itself does not change. Both M2 and M3 use the same namespace:

```scss
@use '@angular/material' as mat;
```

However, in v18+, the M2-specific functions are namespaced with an `m2-` prefix. All unprefixed functions are now M3.

---

## 3. `mat.core()` Mixin

### M2 (v15)

```scss
@include mat.core();
```

Required as the first mixin call. It emitted common styles shared by all components (ripple, overlay, accessibility, etc.).

### M3 (v18)

```scss
// mat.core() is still available but deprecated.
// It is automatically replaced by:
@include mat.elevation-classes();
@include mat.app-background();
```

### M3 (v19)

```scss
// Neither mat.core() nor the v18 replacements are needed.
// The mat.theme() mixin handles everything.
```

**What changed**: In M2, `mat.core()` was a prerequisite that emitted shared styles. In M3 v18, it was split into `elevation-classes()` and `app-background()`. In v19, `mat.theme()` subsumes all core setup, so no separate call is needed.

---

## 4. Palette Definition

### M2 (v15)

```scss
$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent:  mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-warn:    mat.define-palette(mat.$red-palette);
```

`define-palette()` takes a color map and optional default/lighter/darker hue arguments. The map uses numeric keys (50, 100, 200...900, A100...A700) plus contrast values.

### M2 on v18 (renamed)

```scss
// Same API, but function name has m2- prefix
$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$my-accent:  mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);
$my-warn:    mat.m2-define-palette(mat.$m2-red-palette);
```

### M3 (v18+)

```scss
// No define-palette equivalent. Palettes are pre-built tonal palettes
// or generated via schematic. You pass them directly to define-theme/theme.
$my-theme: mat.define-theme((
  color: (
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
));
```

**What changed**: M2 palettes are manually constructed from hue maps with explicit contrast colors. M3 palettes are tonal palettes (auto-generated from a single seed color using HCT color science). You never manually define hue maps in M3 -- you either use a pre-built palette or generate one with `ng generate @angular/material:theme-color`.

---

## 5. Pre-built Palettes

### M2 (v15) -- partial list

```scss
mat.$red-palette
mat.$pink-palette
mat.$purple-palette
mat.$deep-purple-palette
mat.$indigo-palette
mat.$blue-palette
mat.$light-blue-palette
mat.$cyan-palette
mat.$teal-palette
mat.$green-palette
mat.$light-green-palette
mat.$lime-palette
mat.$yellow-palette
mat.$amber-palette
mat.$orange-palette
mat.$deep-orange-palette
mat.$brown-palette
mat.$grey-palette
mat.$blue-grey-palette
```

### M2 on v18 (renamed)

All prefixed with `m2-`:

```scss
mat.$m2-red-palette
mat.$m2-indigo-palette
mat.$m2-pink-palette
// ... etc.
```

### M3 (v18+) -- complete list

```scss
mat.$red-palette
mat.$green-palette
mat.$blue-palette
mat.$yellow-palette
mat.$cyan-palette
mat.$magenta-palette
mat.$orange-palette
mat.$chartreuse-palette
mat.$azure-palette
mat.$violet-palette
mat.$rose-palette
mat.$spring-green-palette
```

**What changed**: M3 provides 12 tonal palettes derived from HCT color space. The M2 palettes (~19 named palettes with manual hue maps) are moved behind the `$m2-` prefix. The M3 palettes are structurally different -- they contain tonal values (0-100) rather than fixed hue steps.

To generate a custom palette from a hex color:

```bash
ng generate @angular/material:theme-color
```

---

## 6. Theme Definition

### M2 (v15)

```scss
$my-light-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
  typography: $my-typography,
  density: 0,
));

$my-dark-theme: mat.define-dark-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
));
```

### M2 on v18 (renamed)

```scss
$my-light-theme: mat.m2-define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
  typography: $my-typography,
  density: 0,
));

$my-dark-theme: mat.m2-define-dark-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
));
```

### M3 (v18)

```scss
$my-theme: mat.define-theme((
  color: (
    theme-type: light,           // or 'dark' or 'color-scheme'
    primary: mat.$violet-palette,
    tertiary: mat.$green-palette,
  ),
  typography: (
    plain-family: 'Roboto',
    brand-family: 'Open Sans',
    bold-weight: 700,
    medium-weight: 500,
    regular-weight: 400,
  ),
  density: (
    scale: 0,
  ),
));
```

### M3 (v19)

```scss
// No longer stored in a variable. Applied directly via mixin.
html {
  @include mat.theme((
    color: (
      primary: mat.$violet-palette,
      tertiary: mat.$green-palette,
      theme-type: light,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

**What changed**:

- M2 has separate `define-light-theme` / `define-dark-theme` functions. M3 unifies them into `define-theme` (v18) or `mat.theme()` mixin (v19) with a `theme-type` parameter.
- M2 uses `primary` / `accent` / `warn`. M3 uses `primary` / `tertiary` (secondary is auto-derived; error is built-in).
- M2 palettes are created with `define-palette`. M3 palettes are passed directly as tonal palette references.
- v19 drops `define-theme()` entirely -- `mat.theme()` is now a mixin (not a function) that directly emits CSS custom properties.

---

## 7. Applying Themes to All Components

### M2 (v15)

```scss
@include mat.core();
@include mat.all-component-themes($my-light-theme);
```

Variant mixins available:

```scss
@include mat.all-component-colors($theme);
@include mat.all-component-typographies($theme);
@include mat.all-component-densities($theme);
```

### M3 (v18)

```scss
// Same mixin name, but pass an M3 theme object
:root {
  @include mat.all-component-themes($my-theme);
}
```

The mixin now emits CSS custom properties instead of direct CSS values.

### M3 (v19)

```scss
// mat.all-component-themes() is replaced by mat.theme()
html {
  @include mat.theme((
    color: mat.$azure-palette,
    typography: Roboto,
    density: 0,
  ));
}
```

**What changed**: `mat.all-component-themes()` works in both M2 and M3 on v18 (it accepts either theme type). In v19, `mat.theme()` replaces it entirely as a single mixin that emits all component styles via design tokens. The `-colors`, `-typographies`, `-densities` variant mixins are deprecated in M3.

---

## 8. Individual Component Theme Mixins

### M2 (v15)

```scss
@include mat.button-theme($theme);
@include mat.card-theme($theme);
@include mat.toolbar-theme($theme);
// Also:
@include mat.button-color($theme);
@include mat.button-typography($theme);
@include mat.button-density($theme);
```

Each component has its own `-theme`, `-color`, `-typography`, and `-density` mixin.

### M3 (v18)

These still exist and accept M3 themes:

```scss
@include mat.button-theme($my-m3-theme);
@include mat.card-theme($my-m3-theme);
```

### M3 (v19)

Component-level theme mixins are deprecated. Use `mat.theme()` for all components, and `mat.*-overrides()` mixins for component-specific token adjustments (see section 17).

**What changed**: The per-component theme mixins are being phased out. In M3, all components read from the same CSS custom properties, so applying the theme once is sufficient. Fine-tuning individual components is done through `overrides()` mixins rather than re-applying a theme.

---

## 9. Color System: Roles and Retrieval

### M2 (v15) -- `mat.get-color-from-palette()`

```scss
$primary-500: mat.get-color-from-palette($my-primary, 500);
$primary-contrast: mat.get-color-from-palette($my-primary, '500-contrast');
$accent-default: mat.get-color-from-palette($my-accent, default);
```

Extracts a specific hue from a palette map using numeric keys (50-900, A100-A700).

### M2 on v18 (renamed)

```scss
$primary-500: mat.m2-get-color-from-palette($my-primary, 500);
```

### M3 (v18) -- `mat.get-theme-color()`

```scss
// By semantic role (preferred)
$primary: mat.get-theme-color($theme, primary);
$on-primary: mat.get-theme-color($theme, on-primary);
$surface: mat.get-theme-color($theme, surface);

// By role + tone (0-100)
$primary-40: mat.get-theme-color($theme, primary, 40);
$primary-80: mat.get-theme-color($theme, primary, 80);
```

### M3 (v19) -- CSS custom properties

```scss
// Preferred: use CSS variables directly
.my-element {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}
```

### Complete M3 Color Role List

**Primary group:**
- `primary`, `on-primary`
- `primary-container`, `on-primary-container`
- `primary-fixed`, `primary-fixed-dim`
- `on-primary-fixed`, `on-primary-fixed-variant`
- `inverse-primary`

**Secondary group:**
- `secondary`, `on-secondary`
- `secondary-container`, `on-secondary-container`
- `secondary-fixed`, `secondary-fixed-dim`
- `on-secondary-fixed`, `on-secondary-fixed-variant`

**Tertiary group:**
- `tertiary`, `on-tertiary`
- `tertiary-container`, `on-tertiary-container`
- `tertiary-fixed`, `tertiary-fixed-dim`
- `on-tertiary-fixed`, `on-tertiary-fixed-variant`

**Error group:**
- `error`, `on-error`
- `error-container`, `on-error-container`

**Surface group:**
- `surface`, `on-surface`, `on-surface-variant`
- `surface-bright`, `surface-dim`
- `surface-container-lowest`, `surface-container-low`
- `surface-container`, `surface-container-high`, `surface-container-highest`

**Utility:**
- `outline`, `outline-variant`
- `scrim`
- `shadow`
- `inverse-surface`, `inverse-on-surface`

**What changed**: M2 uses numeric palette hues (50, 100, 200...900). M3 uses semantic color roles that describe *purpose* rather than shade. The function changes from `get-color-from-palette($palette, $hue)` to `get-theme-color($theme, $role)`. In v19, SCSS functions give way to direct CSS variable usage.

---

## 10. Typography Configuration

### M2 (v15)

```scss
$my-typography: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif',
  $headline-1: mat.define-typography-level(112px, 112px, 300),
  $headline-2: mat.define-typography-level(56px, 56px, 400),
  $headline-3: mat.define-typography-level(45px, 48px, 400),
  $headline-4: mat.define-typography-level(34px, 40px, 400),
  $headline-5: mat.define-typography-level(24px, 32px, 400),
  $headline-6: mat.define-typography-level(20px, 32px, 500),
  $subtitle-1: mat.define-typography-level(16px, 28px, 400),
  $subtitle-2: mat.define-typography-level(14px, 24px, 500),
  $body-1:     mat.define-typography-level(16px, 24px, 400),
  $body-2:     mat.define-typography-level(14px, 20px, 400),
  $caption:    mat.define-typography-level(12px, 20px, 400),
  $button:     mat.define-typography-level(14px, 14px, 500),
);
```

### M2 on v18 (renamed)

```scss
$my-typography: mat.m2-define-typography-config(
  $font-family: 'Roboto, sans-serif',
  $body-1: mat.m2-define-typography-level(16px, 24px, 400),
  // ...
);
```

### M3 (v18) -- integrated into `define-theme`

```scss
$my-theme: mat.define-theme((
  typography: (
    plain-family: 'Roboto',      // Body text, labels
    brand-family: 'Open Sans',   // Headlines, display
    bold-weight: 700,
    medium-weight: 500,
    regular-weight: 400,
  ),
  // ...
));
```

### M3 (v19) -- integrated into `mat.theme()`

```scss
html {
  @include mat.theme((
    typography: Roboto,  // Simple: single font family
    // OR granular:
    // typography: (
    //   plain-family: Roboto,
    //   brand-family: 'Open Sans',
    //   bold-weight: 800,
    //   medium-weight: 500,
    //   regular-weight: 300,
    // ),
    // ...
  ));
}
```

**What changed**: M2 defines typography level-by-level with explicit font-size, line-height, and weight for each level. M3 uses two font families (`plain-family` for body/label, `brand-family` for display/headline) and three weight tiers. Individual level sizing follows the M3 type scale automatically.

---

## 11. Typography Level Access

### M2 (v15)

```scss
.my-element {
  @include mat.typography-level($my-typography, 'body-1');
  // or individual properties:
  font-size: mat.font-size($my-typography, 'body-1');
  line-height: mat.line-height($my-typography, 'body-1');
  font-weight: mat.font-weight($my-typography, 'body-1');
  font-family: mat.font-family($my-typography, 'body-1');
}
```

### M3 (v18) -- `mat.get-theme-typography()`

```scss
.my-element {
  font: mat.get-theme-typography($theme, body-large);
}
```

### M3 (v19) -- CSS custom properties

```scss
.my-element {
  font: var(--mat-sys-body-large);
}
// Or individual properties:
.my-element {
  font-family: var(--mat-sys-body-large-font);
  font-size: var(--mat-sys-body-large-size);
  line-height: var(--mat-sys-body-large-line-height);
  font-weight: var(--mat-sys-body-large-weight);
  letter-spacing: var(--mat-sys-body-large-tracking);
}
```

### Complete M3 Typography Levels

| Category | Levels |
|----------|--------|
| **Display** | `display-large`, `display-medium`, `display-small` |
| **Headline** | `headline-large`, `headline-medium`, `headline-small` |
| **Title** | `title-large`, `title-medium`, `title-small` |
| **Body** | `body-large`, `body-medium`, `body-small` |
| **Label** | `label-large`, `label-medium`, `label-small` |

**What changed**: M2 has 13 named levels (headline-1 through headline-6, subtitle-1/2, body-1/2, caption, button, overline). M3 has 15 levels in a regular 5x3 grid. Access changes from `mat.typography-level()` / `mat.font-size()` to `mat.get-theme-typography()` (v18) or CSS variables (v19).

### M2 to M3 Typography Level Mapping (approximate)

| M2 Level | M3 Equivalent |
|----------|---------------|
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

---

## 12. Density Configuration

### M2 (v15)

```scss
$dense-theme: mat.define-light-theme((
  color: (...),
  density: -2,
));
@include mat.all-component-densities($dense-theme);
```

### M2 on v18 (renamed)

```scss
$dense-theme: mat.m2-define-light-theme((
  color: (...),
  density: -2,
));
```

### M3 (v18)

```scss
$my-theme: mat.define-theme((
  density: (
    scale: -2,   // note: nested under 'scale' key
  ),
  // ...
));
```

### M3 (v19)

```scss
html {
  @include mat.theme((
    density: -2,  // simplified: direct value, no 'scale' key
    // ...
  ));
}
```

**What changed**: The density system itself (0 to -5, each step = -4px) is unchanged. The difference is where you specify it: M2 puts it at the top level of the theme config; M3 v18 nests it under `density: (scale: N)`; M3 v19 simplifies back to a flat `density: N`.

---

## 13. Theme Type Inspection (Light/Dark)

### M2 (v15)

```scss
// Theme type was implicitly set by which function you called
// (define-light-theme vs define-dark-theme).
// To check at runtime in custom mixins:
$color-config: mat.get-color-config($theme);
$is-dark: map.get($color-config, is-dark);
```

### M3 (v18+)

```scss
$type: mat.get-theme-type($theme);
// Returns 'light' or 'dark'

@if $type == dark {
  // dark-mode-specific styles
}
```

**What changed**: M2 required digging into the theme map with `get-color-config()` and reading an `is-dark` boolean. M3 provides `get-theme-type()` which returns a clean `'light'` or `'dark'` string. Note: `get-color-config()` is removed in v18+.

---

## 14. Theme Switching (Light/Dark Mode)

### M2 (v15)

```scss
@include mat.all-component-themes($light-theme);

.dark-theme {
  @include mat.all-component-colors($dark-theme);
}
```

Toggle by adding/removing `.dark-theme` class on `<body>`.

### M3 (v18) -- body class approach

```scss
$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
));

$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
));

html {
  @include mat.all-component-themes($light-theme);
}

.dark-theme {
  @include mat.all-component-themes($dark-theme);
}
```

### M3 (v18) -- `color-scheme` approach

```scss
$theme: mat.define-theme((
  color: (
    theme-type: color-scheme,  // uses CSS light-dark() function
    primary: mat.$azure-palette,
  ),
));

html {
  @include mat.all-component-themes($theme);
}
```

Then toggle via CSS or JS:

```scss
// System preference (automatic)
html { color-scheme: light dark; }

// Force dark
html.dark-theme { color-scheme: dark; }
```

### M3 (v19) -- `color-scheme` approach (simplified)

```scss
html {
  @include mat.theme((
    color: mat.$azure-palette,
    typography: Roboto,
    density: 0,
  ));
}

// Dark mode = just set color-scheme
body.dark-mode {
  color-scheme: dark;
}
```

### M3 (v19) -- separate light/dark palettes

```scss
@mixin apply-light {
  @include mat.theme((
    color: (
      primary: $light-primary-palette,
      tertiary: $light-tertiary-palette,
      theme-type: light,
    ),
    typography: Roboto,
    density: 0,
  ));
}

@mixin apply-dark {
  @include mat.theme((
    color: (
      primary: $dark-primary-palette,
      tertiary: $dark-tertiary-palette,
      theme-type: dark,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

**What changed**: M2 requires re-emitting all color styles under a selector. M3's `color-scheme` approach is dramatically simpler -- when using `theme-type: color-scheme`, the CSS `light-dark()` function handles switching automatically, and you only need to flip the `color-scheme` property. No duplicate CSS emission.

---

## 15. CSS Custom Properties / Design Tokens

M2 does not emit CSS custom properties. All values are compiled into static CSS.

M3 emits all theme values as CSS custom properties. These are the primary extension point.

### System-level color tokens (prefix: `--mat-sys-`)

```scss
// Examples of auto-generated tokens:
--mat-sys-primary
--mat-sys-on-primary
--mat-sys-primary-container
--mat-sys-on-primary-container
--mat-sys-secondary
--mat-sys-on-secondary
--mat-sys-tertiary
--mat-sys-surface
--mat-sys-on-surface
--mat-sys-on-surface-variant
--mat-sys-outline
--mat-sys-outline-variant
--mat-sys-error
--mat-sys-on-error
--mat-sys-surface-container
--mat-sys-surface-container-high
--mat-sys-surface-container-highest
--mat-sys-surface-container-low
--mat-sys-surface-container-lowest
--mat-sys-surface-bright
--mat-sys-surface-dim
--mat-sys-inverse-surface
--mat-sys-inverse-on-surface
--mat-sys-inverse-primary
--mat-sys-scrim
--mat-sys-shadow
```

### System-level typography tokens

```scss
--mat-sys-display-large           // shorthand font
--mat-sys-display-large-font
--mat-sys-display-large-size
--mat-sys-display-large-weight
--mat-sys-display-large-line-height
--mat-sys-display-large-tracking
// Same pattern for all 15 typography levels
```

### System-level elevation tokens

```scss
--mat-sys-level0    // box-shadow: none
--mat-sys-level1    // subtle shadow
--mat-sys-level2
--mat-sys-level3
--mat-sys-level4
--mat-sys-level5    // deepest shadow
```

### System-level state tokens

```scss
--mat-sys-hover-state-layer-opacity
--mat-sys-focus-state-layer-opacity
--mat-sys-pressed-state-layer-opacity
--mat-sys-dragged-state-layer-opacity
```

### System-level shape tokens

```scss
--mat-sys-corner-extra-small
--mat-sys-corner-small
--mat-sys-corner-medium
--mat-sys-corner-large
--mat-sys-corner-extra-large
--mat-sys-corner-full
```

### Component-level tokens (prefix: `--mat-<component>-*`)

Each component also emits its own tokens, e.g.:

```scss
--mat-filled-button-container-color
--mat-filled-button-label-text-color
--mat-card-container-color
--mat-card-title-text-font
--mat-dialog-container-color
--mat-menu-container-color
```

### Using tokens in your styles

```scss
.my-header {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
  font: var(--mat-sys-headline-large);
  box-shadow: var(--mat-sys-level2);
  border-radius: var(--mat-sys-corner-medium);
}
```

---

## 16. System-Level Mixins (v18 only)

These mixins were introduced in v18 alongside `mat.all-component-themes()` for M3:

```scss
@include mat.system-level-colors($theme);
@include mat.system-level-typography($theme);
```

They emit the `--mat-sys-*` CSS custom properties for colors and typography respectively.

In v19, these are subsumed by `mat.theme()` and are no longer needed.

---

## 17. Component-Level Overrides

New in M3. Allows per-component token customization.

### M2 (v15)

No equivalent. You would use deep CSS selectors or re-apply component themes with different palettes.

### M3 (v18+/v19)

```scss
// Override dialog padding globally
:root {
  @include mat.dialog-overrides((
    content-padding: 3rem,
  ));
}

// Override button styles in a specific context
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

**What changed**: The `overrides()` mixins provide a type-safe way to customize component tokens. They validate token names at compile time, ensuring typos are caught early. This replaces the M2 pattern of targeting internal CSS classes (e.g., `.mat-mdc-button`).

---

## 18. System Token Overrides

### M3 (v18+)

```scss
// mat.theme-overrides() sets system-level tokens
.custom-section {
  @include mat.theme-overrides((
    primary: #1a237e,
    on-primary: #ffffff,
    primary-container: #001e2c,
    on-primary-container: #dbe3eb,
    surface: #fafafa,
  ));
}
```

This overrides the `--mat-sys-*` custom properties within the given selector scope, which cascades to all Material components inside that scope.

---

## 19. Strong Focus Indicators

### M2 (v15)

```scss
@include mat.strong-focus-indicators();
@include mat.strong-focus-indicators-theme($theme);
```

### M3 (v18+/v19)

```scss
@include mat.strong-focus-indicators((
  border-color: black,
  border-style: solid,
  border-width: 3px,
  border-radius: 4px,
));

// Theme-aware version:
@include mat.strong-focus-indicators-theme(mat.get-theme-color($theme, primary));
```

**What changed**: The API is largely the same. In M3, the configuration map is more explicit. In v19, you can pass the color directly from a CSS variable: `var(--mat-sys-primary)`.

---

## 20. Custom Component Theming

### M2 (v15)

```scss
@mixin my-component-theme($theme) {
  $color-config: mat.get-color-config($theme);
  $primary: map.get($color-config, primary);
  $accent: map.get($color-config, accent);

  .my-component {
    background: mat.get-color-from-palette($primary, 100);
    color: mat.get-color-from-palette($primary, '100-contrast');
    border-color: mat.get-color-from-palette($accent, default);
  }
}

@mixin my-component-typography($theme) {
  $typography-config: mat.get-typography-config($theme);

  .my-component-title {
    @include mat.typography-level($typography-config, headline-6);
  }
}
```

### M3 (v18)

```scss
@mixin my-component-theme($theme) {
  $type: mat.get-theme-type($theme);

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

### M3 (v19)

```scss
// Preferred: use CSS variables. No theme parameter needed.
.my-component {
  background: var(--mat-sys-primary-container);
  color: var(--mat-sys-on-primary-container);
  border-color: var(--mat-sys-outline);
}

.my-component-title {
  font: var(--mat-sys-title-medium);
}
```

**What changed**: M2 requires extracting config maps and palette objects, then looking up numeric hues. M3 v18 simplifies to semantic role lookups on the theme. M3 v19 eliminates the need for SCSS theme inspection entirely -- just use CSS variables.

---

## 21. Complete Function/Mixin Rename Table

### Functions renamed with `m2-` prefix (v18+)

| Original name (v15) | v18+ M2 name | M3 equivalent |
|---------------------|--------------|---------------|
| `mat.define-palette()` | `mat.m2-define-palette()` | N/A (use pre-built tonal palettes) |
| `mat.define-light-theme()` | `mat.m2-define-light-theme()` | `mat.define-theme()` (v18) / `mat.theme()` (v19) |
| `mat.define-dark-theme()` | `mat.m2-define-dark-theme()` | `mat.define-theme()` (v18) / `mat.theme()` (v19) |
| `mat.define-typography-config()` | `mat.m2-define-typography-config()` | Integrated into `define-theme()` / `theme()` |
| `mat.define-typography-level()` | `mat.m2-define-typography-level()` | N/A (M3 type scale is automatic) |
| `mat.$indigo-palette` | `mat.$m2-indigo-palette` | `mat.$azure-palette` (etc.) |
| `mat.$pink-palette` | `mat.$m2-pink-palette` | `mat.$rose-palette` (etc.) |

### Functions removed (v18+)

| Removed function | Replacement |
|-----------------|-------------|
| `mat.get-color-config()` | `mat.get-theme-color()` / CSS variables |
| `mat.get-typography-config()` | `mat.get-theme-typography()` / CSS variables |
| `mat.get-color-from-palette()` | `mat.get-theme-color($theme, role)` / CSS variables |
| `mat.font-family()` | `mat.get-theme-typography()` / CSS variables |
| `mat.font-size()` | `mat.get-theme-typography()` / CSS variables |
| `mat.font-weight()` | `mat.get-theme-typography()` / CSS variables |
| `mat.line-height()` | `mat.get-theme-typography()` / CSS variables |
| `mat.letter-spacing()` | `mat.get-theme-typography()` / CSS variables |
| `mat.typography-level()` | `mat.get-theme-typography()` / CSS variables |

### Theme inspection functions (unified across M2/M3 on v18+)

| Function | Purpose | Works with M2? | Works with M3? |
|----------|---------|----------------|----------------|
| `mat.get-theme-color($theme, role)` | Get color by semantic role | Yes | Yes |
| `mat.get-theme-color($theme, role, tone)` | Get color by role + tone (0-100) | No | Yes |
| `mat.get-theme-type($theme)` | Returns `'light'` or `'dark'` | Yes | Yes |
| `mat.get-theme-typography($theme, level)` | Get typography shorthand | Yes | Yes |
| `mat.get-theme-density($theme)` | Get density scale value | Yes | Yes |

### Mixins evolution summary

| v15 Mixin | v18 Mixin | v19 Mixin |
|-----------|-----------|-----------|
| `mat.core()` | `mat.elevation-classes()` + `mat.app-background()` | Subsumed by `mat.theme()` |
| `mat.all-component-themes($theme)` | Same | `mat.theme(config)` |
| `mat.all-component-colors($theme)` | Same (deprecated) | Removed |
| `mat.all-component-typographies($theme)` | Same (deprecated) | Removed |
| `mat.all-component-densities($theme)` | Same (deprecated) | Removed |
| `mat.button-theme($theme)` | Same | Deprecated; use `mat.button-overrides()` |
| `mat.card-theme($theme)` | Same | Deprecated; use `mat.card-overrides()` |
| N/A | `mat.system-level-colors($theme)` | Subsumed by `mat.theme()` |
| N/A | `mat.system-level-typography($theme)` | Subsumed by `mat.theme()` |
| N/A | `mat.theme-overrides(tokens)` | Same |
| N/A | `mat.<component>-overrides(tokens)` | Same |
| `mat.typography-hierarchy($config)` | Same (not recommended) | Same (not recommended) |
| `mat.strong-focus-indicators()` | Same | Same |

---

## 22. v18 to v19 Migration Notes

The v18-to-v19 transition is significant because it replaces the function+mixin pattern with a single mixin:

| v18 Pattern | v19 Replacement |
|-------------|-----------------|
| `$theme: mat.define-theme((...))`; then `@include mat.all-component-themes($theme)` | `@include mat.theme((...))` |
| `mat.get-theme-color($theme, primary)` | `var(--mat-sys-primary)` |
| `mat.get-theme-typography($theme, body-large)` | `var(--mat-sys-body-large)` |
| `mat.system-level-colors($theme)` | Included in `mat.theme()` |
| `mat.system-level-typography($theme)` | Included in `mat.theme()` |
| CSS variable prefix `--sys-*` | Changed to `--mat-sys-*` |
| Body class + re-emit theme for dark mode | `color-scheme: dark` on any ancestor |

### v19 Utility Classes (via `mat.system-classes()`)

v19 also provides optional utility classes:

```scss
@include mat.system-classes();
```

This generates classes like:
- `mat-bg-primary`, `mat-bg-surface`, `mat-bg-primary-container`
- `mat-text-on-surface`, `mat-text-primary`, `mat-text-on-primary`
- `mat-font-body-lg`, `mat-font-headline-md`, `mat-font-display-sm`

---

## Quick Migration Checklists

### Migrating v15 M2 to v18 M3

1. Replace `mat.define-palette()` with pre-built M3 tonal palettes
2. Replace `mat.define-light-theme()` / `mat.define-dark-theme()` with `mat.define-theme()`
3. Replace `primary` / `accent` / `warn` with `primary` / `tertiary` in color config
4. Replace `mat.define-typography-config()` with typography map in `define-theme()`
5. Replace `mat.core()` with `mat.elevation-classes()` + `mat.app-background()`
6. Replace `mat.get-color-from-palette()` with `mat.get-theme-color()`
7. Replace `mat.typography-level()` with `mat.get-theme-typography()`
8. Replace numeric hue lookups (500, A200) with semantic roles (primary, on-primary)
9. Update dark theme toggle to use `theme-type: dark` in `define-theme()`
10. Add `mat.system-level-colors()` and `mat.system-level-typography()` if using CSS variables

### Migrating v18 M3 to v19 M3

1. Replace `$theme: mat.define-theme((...))` + `@include mat.all-component-themes($theme)` with `@include mat.theme((...))`
2. Replace `mat.get-theme-color($theme, role)` with `var(--mat-sys-role)`
3. Replace `mat.get-theme-typography($theme, level)` with `var(--mat-sys-level)`
4. Remove `mat.elevation-classes()` and `mat.app-background()` (handled by `mat.theme()`)
5. Remove `mat.system-level-colors()` and `mat.system-level-typography()` (handled by `mat.theme()`)
6. Update dark mode to use `color-scheme: dark` instead of re-applying a theme
7. Replace per-component `-theme()` mixins with `-overrides()` mixins where needed
8. Update `--sys-*` to `--mat-sys-*` prefix if referencing CSS variables

---

## Sources

- [Angular Material v18 Theming Guide](https://v18.material.angular.dev/guide/theming)
- [Angular Material v19+ Theming Guide](https://material.angular.dev/guide/theming)
- [Angular Material Theming Your Components](https://material.angular.dev/guide/theming-your-components)
- [Angular Material v18 SASS API Changes (M2 vs M3) -- Dharmen Shah](https://gist.github.com/shhdharmen/435f11430bcc4eb6ef9bdb768917d513)
- [Updating Angular Material 18 to 19 -- angular-ui.com](https://angular-ui.com/courses/angular-material-theming/updating-18)
- [Updating to Angular Material 18: M2 and M3 Support -- DEV Community](https://dev.to/ngmaterialdev/updating-to-angular-material-18-keeping-support-for-material-2-and-adding-support-for-material-3-456a)
- [Angular Material M3 Theming -- angular.love](https://angular.love/angular-material-theming-application-with-material-3/)
- [M3 Design Tokens and System Variables -- Konstantin Denerz](https://konstantin-denerz.com/angular-material-3-theming-design-tokens-and-system-variables/)
- [Material 3 Experimental Support (v17) -- Angular Blog](https://blog.angular.dev/material-3-experimental-support-in-angular-17-2-8e681dfd050e)
- [Angular Material GitHub: theming.md](https://github.com/angular/components/blob/main/guides/theming.md)
- [Material Design 3 Color Roles](https://m3.material.io/styles/color/roles)
