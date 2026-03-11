# Angular Material Migration Manual: v14 to Material Design 3

> **Audience**: Junior developer new to Angular Material theming
> **Starting point**: Angular Material v14 (Material Design 2)
> **Target**: Angular Material v18+ (Material Design 3, stable)
> **Scope**: SCSS themes, HTML templates, TypeScript imports, theme switching architecture

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [What Changes and What Doesn't](#2-what-changes-and-what-doesnt)
3. [Phase 1: v14 to v15 (MDC Migration)](#3-phase-1-v14-to-v15-mdc-migration)
4. [Phase 2: v15 to v17 (Remove Legacy Imports)](#4-phase-2-v15-to-v17-remove-legacy-imports)
5. [Phase 3: v17/v18 (Convert to M3 Theming)](#5-phase-3-v17v18-convert-to-m3-theming)
6. [SCSS Theme Migration: M2 to M3 (Complete Guide)](#6-scss-theme-migration-m2-to-m3-complete-guide)
7. [Template Migration: M2 to M3 (Complete Guide)](#7-template-migration-m2-to-m3-complete-guide)
8. [Theme Switching Architecture](#8-theme-switching-architecture)
9. [Custom Component Theming in M3](#9-custom-component-theming-in-m3)
10. [Common Pitfalls and Gotchas](#10-common-pitfalls-and-gotchas)
11. [Reference A: SCSS Theme Conversions (Alphabetical)](#reference-a-scss-theme-conversions-alphabetical)
12. [Reference B: HTML Template Conversions (Alphabetical)](#reference-b-html-template-conversions-alphabetical)

---

## 1. The Big Picture

You are migrating through **three design system eras** that happen across **five Angular Material versions**:

```
v14 (M2)  →  v15 (MDC migration)  →  v16  →  v17 (legacy removed)  →  v18 (M3 stable)
   │                │                                 │                        │
   │                │                                 │                        │
Pure M2         M2 components          Legacy imports    M3 theming
components      rebuilt on MDC-Web     deleted           becomes stable
                Old ones aliased
                as "MatLegacy*"
```

**Key vocabulary**:

| Term | What It Means |
|------|---------------|
| **M2 / M3** | Material Design 2 and Material Design 3 — Google's *design specifications* |
| **MDC-Web** | Material Design Components for Web — Google's reference vanilla JS/CSS library |
| **Legacy components** | Angular Material's old custom implementations (what v14 uses) |
| **MDC-based components** | New v15 implementations built on top of MDC-Web. Same API, different internals |
| **Design tokens** | CSS custom properties (`--mat-sys-*`) that M3 uses instead of baked-in SCSS values |

### Why three phases?

You could jump straight from v14 to v18, but understanding the phases prevents confusion:

- **Phase 1 (v14→v15)**: The *component internals* change (DOM structure, CSS classes). Templates and SCSS need updates. The design system stays M2.
- **Phase 2 (v15→v17)**: Remove `MatLegacy*` imports. No new concepts — just finishing the MDC migration.
- **Phase 3 (v17→v18)**: The *design system* changes from M2 to M3. SCSS theming is completely rewritten. Templates barely change.

---

## 2. What Changes and What Doesn't

### Things that DON'T change (across the entire migration)

- Template selectors: `<mat-table>`, `mat-sort-header`, `<mat-paginator>`, `<mat-card>`, `mat-button`, `<mat-form-field>` — all the same element/attribute selectors
- TypeScript class names: `MatTableModule`, `MatTableDataSource`, `MatSort`, `MatPaginator`
- Angular module structure: still `imports: [MatTableModule]` in your NgModule
- The concept of body-class-based theme switching

### Things that DO change

| What | Phase | Impact |
|------|-------|--------|
| Import paths (`@angular/material/legacy-table` → `@angular/material/table`) | Phase 1→2 | TypeScript |
| CSS class names (`.mat-header-cell` → `.mat-mdc-header-cell`) | Phase 1 | SCSS |
| DOM structure inside components | Phase 1 | SCSS (especially `::ng-deep` selectors) |
| Palette definition API (`mat.define-palette()` → `mat.define-theme()`) | Phase 3 | SCSS |
| Color model (primary/accent/warn → primary/secondary/tertiary/error) | Phase 3 | SCSS |
| Theme output (compiled values → CSS custom properties) | Phase 3 | SCSS |
| Typography system (13 named levels → 15 levels in 5×3 grid) | Phase 3 | SCSS |
| A few component templates (chips, slider, form field, list, tabs, snack bar) | Phase 1 | HTML |

---

## 3. Phase 1: v14 to v15 (MDC Migration)

### 3.1 Run the Angular update

```bash
# Step 1: Update Angular core to v15
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 --allow-dirty --force

# Step 2: Update Material + CDK (auto-applies legacy aliases)
npx @angular/cli@15 update @angular/material@15 --allow-dirty --force

# Step 3: Verify build with legacy imports
ng build
```

After step 2, the schematic rewrites your imports:

```typescript
// BEFORE (v14)
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

// AFTER (v15 — legacy aliases)
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
```

Your app builds and runs, but it's using deprecated legacy components.

### 3.2 Run the MDC migration schematic

```bash
# Convert legacy imports to MDC-based components
ng generate @angular/material:mdc-migration

# Find all TODO comments left by the migration
grep -r "TODO(mdc-migration)" src/
```

This does three things:
1. Removes the `Legacy` prefix and `legacy-` import paths
2. Updates templates where needed
3. Adds `/* TODO(mdc-migration): */` comments for CSS it can't auto-fix

### 3.3 Fix CSS selectors (the manual work)

MDC-based components use different CSS class names. Most follow a pattern — `.mat-*` becomes `.mat-mdc-*` — but some are renamed entirely.

**Example: Data table SCSS before and after**

```scss
// BEFORE (v14 / legacy)
:host ::ng-deep .themed-mat-table {
  .mat-header-row {
    background: var(--theme-table-header-bg) !important;
  }
  .mat-header-cell {
    color: var(--theme-table-header-text) !important;
  }
  .mat-row {
    background: var(--theme-table-row-bg) !important;
  }
  .mat-cell {
    color: var(--theme-table-cell-text) !important;
  }
}

// AFTER (v15 MDC)
:host ::ng-deep .themed-mat-table {
  .mat-mdc-header-row {
    background: var(--theme-table-header-bg) !important;
  }
  .mat-mdc-header-cell {
    color: var(--theme-table-header-text) !important;
  }
  .mat-mdc-row {
    background: var(--theme-table-row-bg) !important;
  }
  .mat-mdc-cell {
    color: var(--theme-table-cell-text) !important;
  }
}
```

> **Warning**: Don't blindly find-and-replace `.mat-` → `.mat-mdc-`. Some components (MatSort, MatBadge, MatToolbar, etc.) were NOT part of the MDC migration and keep their original class names. Follow the TODO comments the schematic generates.

### 3.4 Visual differences to expect

MDC-based components render with different defaults:

- **Spacing**: padding/margins differ (e.g., table cells now have 16px left/right padding)
- **Row height**: table rows changed from 48px to 52px
- **Typography**: font sizes and weights may shift
- **Ripple**: MDC uses its own ripple implementation; ripples persist after click
- **Density**: default density may feel more spacious
- **Touch targets**: larger for accessibility

These aren't bugs — they're MDC-Web defaults. Adjust your custom CSS to compensate.

---

## 4. Phase 2: v15 to v17 (Remove Legacy Imports)

If you did the MDC migration in Phase 1, this phase is mostly `ng update` commands:

```bash
npx @angular/cli@16 update @angular/core@16 @angular/cli@16 --allow-dirty --force
npx @angular/cli@16 update @angular/material@16 --allow-dirty --force
ng build

npx @angular/cli@17 update @angular/core@17 @angular/cli@17 --allow-dirty --force
npx @angular/cli@17 update @angular/material@17 --allow-dirty --force
ng build
```

**Critical**: In v17, all `MatLegacy*` imports are **deleted from the library**. If any legacy imports remain in your code, the build will fail. Fix them before upgrading to v17.

---

## 5. Phase 3: v17/v18 (Convert to M3 Theming)

This is the biggest conceptual change. The *design system* itself changes from Material Design 2 to Material Design 3.

### 5.1 What changes conceptually

| Aspect | M2 (v14/v15) | M3 (v18+) |
|--------|--------------|-----------|
| **Color model** | Primary / Accent / Warn with numeric hues (50-900) | Primary / Secondary / Tertiary / Error with semantic roles |
| **Palette type** | Fixed hue maps (50, 100, 200...A700) | Tonal palettes (0-100 tone scale, auto-generated) |
| **Theming output** | Compiled SCSS values baked into CSS | CSS custom properties (design tokens) |
| **Typography** | 13 named levels (headline-1, body-1, etc.) | 15 levels in 5×3 grid (display-large, body-medium, etc.) |
| **Customization** | Override internal CSS classes with `::ng-deep` | Use `--mat-*` CSS custom properties or `mat.*-overrides()` mixins |

### 5.2 The M3 color model

M2 uses three palettes: **primary**, **accent**, and **warn**. Each palette is a map of numeric hues (50, 100, 200...900, A100...A700).

M3 uses four color groups — **primary**, **secondary**, **tertiary**, and **error** — each generating a set of semantic roles:

```
primary          →  primary, on-primary, primary-container, on-primary-container
secondary        →  secondary, on-secondary, secondary-container, on-secondary-container
tertiary         →  tertiary, on-tertiary, tertiary-container, on-tertiary-container
error            →  error, on-error, error-container, on-error-container
surface group    →  surface, on-surface, surface-container, surface-container-high, etc.
utility          →  outline, outline-variant, scrim, shadow
```

You no longer pick "hue 500 from the indigo palette." You pick the `primary` role and let M3's tonal palette system generate the right shade automatically.

### 5.3 Converting your themes.scss

Here is a complete before/after showing the same four-theme setup:

**M2 (v15) — what you have now:**

```scss
@use '@angular/material' as mat;

// Typography
$popout-typography: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif'
);

// Dark theme (default)
$dark-primary: mat.define-palette(mat.$blue-grey-palette, 700, 300, 900);
$dark-accent:  mat.define-palette(mat.$light-blue-palette, A200, A100, A400);
$dark-warn:    mat.define-palette(mat.$red-palette);
$dark-theme: mat.define-dark-theme((
  color: (primary: $dark-primary, accent: $dark-accent, warn: $dark-warn),
  typography: $popout-typography,
  density: 0,
));

// Light theme
$light-primary: mat.define-palette(mat.$indigo-palette, 500, 100, 700);
$light-accent:  mat.define-palette(mat.$pink-palette, A200, A100, A400);
$light-warn:    mat.define-palette(mat.$red-palette);
$light-theme: mat.define-light-theme((
  color: (primary: $light-primary, accent: $light-accent, warn: $light-warn),
  typography: $popout-typography,
  density: 0,
));

// Apply
@include mat.core();
@include mat.all-component-themes($dark-theme);

body.light-theme {
  @include mat.all-component-colors($light-theme);
}

// Bridge to CSS custom properties
body.dark-theme {
  --theme-table-header-bg: #{mat.get-color-from-palette($dark-primary, 700)};
  --theme-text-primary: #e0e0e0;
}
body.light-theme {
  --theme-table-header-bg: #{mat.get-color-from-palette($light-primary, 100)};
  --theme-text-primary: #333333;
}
```

**M3 (v18) — what you're converting to:**

```scss
@use '@angular/material' as mat;

// Dark theme
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

// Light theme
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

// Apply (no mat.core() needed in M3)
html {
  @include mat.all-component-themes($dark-theme);
}

body.light-theme {
  @include mat.all-component-themes($light-theme);
}

// Bridge to CSS custom properties (M3 generates --mat-sys-* tokens automatically)
// For custom elements, use the tokens directly:
body.dark-theme {
  --theme-table-header-bg: var(--mat-sys-surface-container);
  --theme-text-primary: var(--mat-sys-on-surface);
}
body.light-theme {
  --theme-table-header-bg: var(--mat-sys-surface-container);
  --theme-text-primary: var(--mat-sys-on-surface);
}
```

**M3 (v19) — the simplified API:**

```scss
@use '@angular/material' as mat;

// No define-theme() needed — mat.theme() is a mixin that emits directly
html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
      theme-type: dark,
    ),
    typography: Roboto,
    density: 0,
  ));
}

body.light-theme {
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

// Custom elements use M3 design tokens directly
.my-header {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
  font: var(--mat-sys-headline-large);
}
```

### 5.4 Generating custom palettes

M3 provides 12 pre-built tonal palettes:

```scss
mat.$red-palette       mat.$green-palette     mat.$blue-palette
mat.$yellow-palette    mat.$cyan-palette      mat.$magenta-palette
mat.$orange-palette    mat.$chartreuse-palette mat.$azure-palette
mat.$violet-palette    mat.$rose-palette      mat.$spring-green-palette
```

To generate a custom palette from a hex color:

```bash
ng generate @angular/material:theme-color
```

This produces a SCSS file with a tonal palette you can use in `define-theme()`.

---

## 6. SCSS Theme Migration: M2 to M3 (Complete Guide)

### 6.1 Import statement

Unchanged. Both M2 and M3 use:

```scss
@use '@angular/material' as mat;
```

However, in v18+, M2-specific functions get an `m2-` prefix. Unprefixed functions are now M3.

### 6.2 mat.core()

```scss
// M2 (v15) — required
@include mat.core();

// M3 (v18) — replaced by:
@include mat.elevation-classes();
@include mat.app-background();

// M3 (v19) — not needed at all (mat.theme() handles it)
```

### 6.3 Palette definition

```scss
// M2 (v15)
$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent:  mat.define-palette(mat.$pink-palette, A200, A100, A400);

// M3 (v18) — no define-palette(). Pass tonal palettes directly:
$my-theme: mat.define-theme((
  color: (
    primary: mat.$azure-palette,
    tertiary: mat.$blue-palette,
  ),
));
```

### 6.4 Theme definition

```scss
// M2 — separate light/dark functions, primary/accent/warn
$light: mat.define-light-theme(( color: (primary: $p, accent: $a, warn: $w) ));
$dark:  mat.define-dark-theme(( color: (primary: $p, accent: $a, warn: $w) ));

// M3 (v18) — unified function, primary/tertiary, theme-type parameter
$light: mat.define-theme(( color: (theme-type: light, primary: mat.$azure-palette, tertiary: mat.$blue-palette) ));
$dark:  mat.define-theme(( color: (theme-type: dark,  primary: mat.$azure-palette, tertiary: mat.$blue-palette) ));

// M3 (v19) — no variable needed, mixin emits directly
html {
  @include mat.theme((
    color: (theme-type: light, primary: mat.$azure-palette),
    typography: Roboto,
    density: 0,
  ));
}
```

### 6.5 Applying themes

```scss
// M2
@include mat.all-component-themes($default-theme);    // full theme (once)
.dark-theme {
  @include mat.all-component-colors($dark-theme);      // color-only override
}

// M3 (v18)
:root { @include mat.all-component-themes($light-theme); }
.dark-theme { @include mat.all-component-themes($dark-theme); }

// M3 (v19) — mat.theme() replaces all-component-themes()
html { @include mat.theme((...)); }
.dark-theme { @include mat.theme((...)); }
```

### 6.6 Extracting colors

```scss
// M2 — numeric hues from palettes
$color: mat.get-color-from-palette($my-primary, 500);
$contrast: mat.get-color-from-palette($my-primary, '500-contrast');

// M3 (v18) — semantic roles from themes
$color: mat.get-theme-color($theme, primary);
$on-color: mat.get-theme-color($theme, on-primary);
$surface: mat.get-theme-color($theme, surface);

// M3 (v19) — CSS custom properties (preferred)
.my-element {
  background: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}
```

### 6.7 Typography

```scss
// M2 — explicit level configuration
$typo: mat.define-typography-config(
  $font-family: 'Roboto, sans-serif',
  $headline-1: mat.define-typography-level(112px, 112px, 300),
  $body-1: mat.define-typography-level(16px, 24px, 400),
);

// M2 — accessing levels
.my-el { @include mat.typography-level($typo, 'body-1'); }
.my-el { font-size: mat.font-size($typo, 'body-1'); }

// M3 (v18) — integrated into define-theme()
$theme: mat.define-theme((
  typography: (
    plain-family: 'Roboto',      // body text
    brand-family: 'Open Sans',   // headlines
    bold-weight: 700,
    medium-weight: 500,
    regular-weight: 400,
  ),
));

// M3 (v18) — accessing levels
.my-el { font: mat.get-theme-typography($theme, body-large); }

// M3 (v19) — CSS variables
.my-el { font: var(--mat-sys-body-large); }
```

**M2 → M3 typography level mapping:**

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

### 6.8 Density

```scss
// M2
$dense: mat.define-light-theme(( color: (...), density: -2 ));
@include mat.all-component-densities($dense);

// M3 (v18)
$theme: mat.define-theme(( density: (scale: -2) ));

// M3 (v19)
@include mat.theme(( density: -2 ));
```

Density scale is unchanged: 0 to -5, each step = -4px.

### 6.9 Theme switching with body classes

The body-class pattern works identically in both M2 and M3. The only difference is what SCSS you emit under each class:

```scss
// M3 (v18) — multi-theme switching
$dark-theme: mat.define-theme((color: (theme-type: dark, primary: mat.$azure-palette)));
$light-theme: mat.define-theme((color: (theme-type: light, primary: mat.$violet-palette)));
$crimson-theme: mat.define-theme((color: (theme-type: dark, primary: mat.$red-palette)));

html { @include mat.all-component-themes($dark-theme); }
body.light-theme { @include mat.all-component-themes($light-theme); }
body.crimson-theme { @include mat.all-component-themes($crimson-theme); }
```

The TypeScript/JavaScript side (class swap on `<body>`) does not change at all.

### 6.10 Component-level overrides (new in M3)

M3 introduces `*-overrides()` mixins for fine-tuning individual component tokens:

```scss
// Override dialog padding
:root {
  @include mat.dialog-overrides((
    content-padding: 3rem,
  ));
}

// Override button text style in a specific section
.uppercase-buttons {
  @include mat.button-overrides((
    filled-label-text-transform: uppercase,
  ));
}

// Override card container color
.custom-card {
  @include mat.card-overrides((
    container-color: #f5f5f5,
  ));
}
```

These validate token names at compile time, catching typos early. This replaces the M2 pattern of targeting internal CSS classes with `::ng-deep`.

### 6.11 System-level token overrides

```scss
// Override --mat-sys-* tokens for a scope
.custom-section {
  @include mat.theme-overrides((
    primary: #1a237e,
    on-primary: #ffffff,
    surface: #fafafa,
  ));
}
```

---

## 7. Template Migration: M2 to M3 (Complete Guide)

> **Key insight**: Most template changes happen during the MDC migration (v15), not the M3 migration (v18). M3 is primarily a *theming/SCSS* concern. Template selectors established during the MDC migration carry through to M3 unchanged.

### 7.1 Components with NO template changes

These components use the same selectors across v14 → v18:

- Autocomplete (`<mat-autocomplete>`, `[matAutocomplete]`)
- Badge (`[matBadge]`)
- Bottom Sheet (opened programmatically)
- Button (`mat-button`, `mat-raised-button`, etc.)
- Button Toggle (`<mat-button-toggle-group>`)
- Card (`<mat-card>`)
- Checkbox (`<mat-checkbox>`)
- Datepicker (`<mat-datepicker>`, `[matDatepicker]`)
- Dialog (`mat-dialog-title`, `<mat-dialog-content>`, etc.)
- Divider (`<mat-divider>`)
- Expansion Panel (`<mat-expansion-panel>`)
- Icon (`<mat-icon>`)
- Input (`matInput`)
- Menu (`<mat-menu>`, `[matMenuTriggerFor]`)
- Paginator (`<mat-paginator>`)
- Progress Bar (`<mat-progress-bar>`)
- Progress Spinner (`<mat-progress-spinner>`)
- Radio Button (`<mat-radio-group>`, `<mat-radio-button>`)
- Select (`<mat-select>`, `<mat-option>`)
- Sidenav (`<mat-sidenav>`)
- Sort Header (`matSort`, `mat-sort-header`)
- Stepper (`<mat-stepper>`)
- Table (`mat-table`, `mat-header-cell`, etc.)
- Toolbar (`<mat-toolbar>`)
- Tooltip (`[matTooltip]`)
- Tree (`<mat-tree>`)

### 7.2 Components with MAJOR template changes

#### Chips — complete restructure

```html
<!-- M2 (v14) -->
<mat-chip-list>
  <mat-chip *ngFor="let chip of chips" [selected]="chip.selected">
    {{ chip.name }}
  </mat-chip>
</mat-chip-list>

<mat-chip-list #chipList>
  <mat-chip *ngFor="let fruit of fruits" [removable]="true" (removed)="remove(fruit)">
    {{ fruit }}
    <mat-icon matChipRemove>cancel</mat-icon>
  </mat-chip>
  <input [matChipInputFor]="chipList" (matChipInputTokenEnd)="add($event)">
</mat-chip-list>

<!-- M3 (v18+) — three distinct variants -->
<!-- Selection chips -->
<mat-chip-listbox>
  <mat-chip-option *ngFor="let chip of chips" [selected]="chip.selected">
    {{ chip.name }}
  </mat-chip-option>
</mat-chip-listbox>

<!-- Input + removable chips -->
<mat-chip-grid #chipGrid>
  <mat-chip-row *ngFor="let fruit of fruits" (removed)="remove(fruit)">
    {{ fruit }}
    <button matChipRemove>           <!-- must be <button>, not <mat-icon> -->
      <mat-icon>cancel</mat-icon>
    </button>
  </mat-chip-row>
  <input [matChipInputFor]="chipGrid" (matChipInputTokenEnd)="add($event)">
</mat-chip-grid>

<!-- Static display chips -->
<mat-chip-set>
  <mat-chip *ngFor="let chip of chips">{{ chip.name }}</mat-chip>
</mat-chip-set>
```

**Key changes**:
- `<mat-chip-list>` splits into `<mat-chip-listbox>`, `<mat-chip-grid>`, or `<mat-chip-set>`
- `<mat-chip>` becomes `<mat-chip-option>` (in listbox) or `<mat-chip-row>` (in grid)
- `matChipRemove` must be on a `<button>`, not directly on `<mat-icon>`
- `[removable]` input removed — removability is implicit from having a `matChipRemove` button

#### Slider — requires child input element

```html
<!-- M2 (v14) -->
<mat-slider [min]="0" [max]="100" [(ngModel)]="value" thumbLabel></mat-slider>

<!-- M3 (v18+) -->
<mat-slider [min]="0" [max]="100" discrete>
  <input matSliderThumb [(ngModel)]="value">    <!-- binding moves to input -->
</mat-slider>

<!-- Range slider (NEW — not possible in M2) -->
<mat-slider [min]="0" [max]="100">
  <input matSliderStartThumb [(ngModel)]="startValue">
  <input matSliderEndThumb [(ngModel)]="endValue">
</mat-slider>
```

**Key changes**:
- `[(ngModel)]` and `[value]` move from `<mat-slider>` to child `<input matSliderThumb>`
- `thumbLabel` → `discrete`
- `[tickInterval]` → `showTickMarks` (ticks match step interval)
- `vertical` and `invert` properties are **permanently removed** with no replacement

#### Form Field — appearance and prefix/suffix changes

```html
<!-- M2 (v14) -->
<mat-form-field appearance="standard">
  <input matInput placeholder="Name">
  <span matPrefix>$</span>
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>

<!-- M3 (v18+) -->
<mat-form-field appearance="fill">          <!-- "standard" and "legacy" removed -->
  <mat-label>Name</mat-label>               <!-- now REQUIRED -->
  <input matInput placeholder="Name">
  <span matTextPrefix>$&nbsp;</span>         <!-- matPrefix → matTextPrefix -->
  <mat-icon matIconSuffix>search</mat-icon>  <!-- matSuffix → matIconSuffix -->
</mat-form-field>
```

**Key changes**:
- `appearance="legacy"` and `appearance="standard"` are **removed**. Use `"fill"` or `"outline"`
- `<mat-label>` is now **required** for accessibility
- `matPrefix`/`matSuffix` → `matTextPrefix`/`matTextSuffix` (text) or `matIconPrefix`/`matIconSuffix` (icons)
- Placeholders no longer promote to floating labels

#### List — new structural directives

```html
<!-- M2 (v14) -->
<mat-list>
  <mat-list-item>
    <mat-icon mat-list-icon>folder</mat-icon>
    <span mat-line>First line</span>
    <span mat-line>Second line</span>
  </mat-list-item>
</mat-list>

<!-- M3 (v18+) -->
<mat-list>
  <mat-list-item>
    <mat-icon matListItemIcon>folder</mat-icon>
    <span matListItemTitle>First line</span>
    <span matListItemLine>Second line</span>
  </mat-list-item>
</mat-list>
```

**Key changes**:
- `mat-list-icon` → `matListItemIcon`
- `mat-list-avatar` → `matListItemAvatar`
- `mat-line` → `matListItemTitle` (first line) / `matListItemLine` (subsequent lines)
- New: `matListItemMeta` for trailing metadata

#### Tabs — nav bar requires panel reference

```html
<!-- M2 (v14) -->
<nav mat-tab-nav-bar>
  <a mat-tab-link *ngFor="let link of links"
     [routerLink]="link.path" [active]="rla.isActive"
     routerLinkActive #rla="routerLinkActive">
    {{ link.label }}
  </a>
</nav>
<div>Routed content here</div>

<!-- M3 (v18+) — tabPanel reference REQUIRED -->
<nav mat-tab-nav-bar [tabPanel]="tabPanel">
  <a mat-tab-link *ngFor="let link of links"
     [routerLink]="link.path" [active]="rla.isActive"
     routerLinkActive #rla="routerLinkActive">
    {{ link.label }}
  </a>
</nav>
<mat-tab-nav-panel #tabPanel>
  Routed content here
</mat-tab-nav-panel>
```

#### Snack Bar — custom snack bars need structural directives

```html
<!-- M2 (v14) — custom snack bar component -->
<div>
  <span>{{ message }}</span>
  <button mat-button (click)="dismiss()">Dismiss</button>
</div>

<!-- M3 (v18+) -->
<div>
  <span matSnackBarLabel>{{ message }}</span>
  <span matSnackBarActions>
    <button mat-button matSnackBarAction (click)="dismiss()">Dismiss</button>
  </span>
</div>
```

Simple text snack bars opened via `snackBar.open('message', 'action')` require no changes.

---

## 8. Theme Switching Architecture

Two patterns exist for theme switching. Both produce identical runtime behavior.

### Pattern A: Dedicated ThemeService

```typescript
// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<ThemeOption>(DEFAULT_THEME);
  readonly theme$ = this.currentTheme$.asObservable();

  setTheme(theme: ThemeOption): void {
    localStorage.setItem('popout-theme', theme.value);
    THEMES.forEach(t => document.body.classList.remove(t.cssClass));
    document.body.classList.add(theme.cssClass);
    this.currentTheme$.next(theme);
  }
}
```

### Pattern B: Generic UserPreferencesService (no theme knowledge)

```typescript
// user-preferences.service.ts — knows nothing about themes
export interface UserPreference { key: string; value: string; }

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private preferences$ = new BehaviorSubject<UserPreference[]>([]);

  getPreference$(key: string): Observable<string | undefined> {
    return this.all$.pipe(map(prefs => prefs.find(p => p.key === key)?.value));
  }

  setPreference(key: string, value: string): void {
    // update BehaviorSubject, persist via REST API
  }
}

// theme.constants.ts — shared UI-layer mapping
export interface ThemeOption { label: string; value: string; cssClass: string; }
export const THEMES: ThemeOption[] = [
  { label: 'Dark', value: 'dark', cssClass: 'dark-theme' },
  { label: 'Light', value: 'light', cssClass: 'light-theme' },
];

// app.component.ts — subscribes, translates, applies body class
ngOnInit() {
  this.themeSub = this.userPrefs.getPreference$('theme').subscribe(val => {
    const theme = THEMES.find(t => t.value === val) || DEFAULT_THEME;
    this.selectedTheme = theme;
    THEMES.forEach(t => document.body.classList.remove(t.cssClass));
    document.body.classList.add(theme.cssClass);
  });
}
```

### The runtime result is the same

Both patterns end with a single class swap on `<body>`:

```
document.body.classList = 'sapphire-theme'
  → CSS specificity activates body.sapphire-theme rules
    → mat.all-component-themes() styles take effect
    → --theme-* / --mat-sys-* custom properties resolve
      → var() references update throughout the app
```

No JavaScript recalculates colors. One class swap triggers a pure CSS cascade.

---

## 9. Custom Component Theming in M3

### 9.1 The M2 way (v15): palette extraction with ::ng-deep

```scss
@mixin my-component-theme($theme) {
  $color-config: mat.get-color-config($theme);
  $primary: map.get($color-config, primary);

  .my-component {
    background: mat.get-color-from-palette($primary, 100);
    color: mat.get-color-from-palette($primary, '100-contrast');
  }
}
```

### 9.2 The M3 way (v18): semantic role extraction

```scss
@mixin my-component-theme($theme) {
  .my-component {
    background: mat.get-theme-color($theme, primary-container);
    color: mat.get-theme-color($theme, on-primary-container);
    border-color: mat.get-theme-color($theme, outline);
  }
}
```

### 9.3 The M3 way (v19): CSS custom properties

```scss
// No SCSS theme parameter needed — just use the tokens
.my-component {
  background: var(--mat-sys-primary-container);
  color: var(--mat-sys-on-primary-container);
  border-color: var(--mat-sys-outline);
  font: var(--mat-sys-title-medium);
  border-radius: var(--mat-sys-corner-medium);
  box-shadow: var(--mat-sys-level2);
}
```

### 9.4 Bridging M3 tokens to custom CSS variables

If you have existing components that use `var(--theme-table-header-bg)` etc., bridge them to M3 tokens:

```scss
body.dark-theme {
  // Bridge: old custom properties → new M3 tokens
  --theme-table-header-bg: var(--mat-sys-surface-container);
  --theme-table-header-text: var(--mat-sys-on-surface);
  --theme-table-row-bg: var(--mat-sys-surface);
  --theme-table-row-hover-bg: var(--mat-sys-surface-container-high);
  --theme-text-primary: var(--mat-sys-on-surface);
  --theme-text-muted: var(--mat-sys-on-surface-variant);
  --theme-border: var(--mat-sys-outline-variant);
  --theme-accent-gradient: var(--mat-sys-primary);
}
```

This lets you migrate custom components incrementally — bridge first, then convert to direct `var(--mat-sys-*)` usage later.

---

## 10. Common Pitfalls and Gotchas

### 10.1 Dialog padding disappears

In MDC, `.mat-dialog-container` no longer has 24px padding. Use `mat-dialog-title`, `mat-dialog-content`, and `mat-dialog-actions` structural directives — they own their own padding now. If your dialog skips these directives, you'll lose all padding.

### 10.2 Form field height changes

MDC form fields are taller. Height increases, horizontal padding goes from 8px to 16px. This can break layouts that were pixel-precise. Use `subscriptSizing: 'dynamic'` to avoid reserved space below fields.

### 10.3 Slide toggle is no longer a checkbox

MDC implementation uses `<button role="switch">` instead of `<input type="checkbox">`. It **no longer responds to native form validation**. Touch target is much larger.

### 10.4 Card appearance defaulting

The migration schematic auto-migrates cards to `appearance="outlined"`. The old M2 default was effectively "raised" (shadow). Review each card and set `appearance="raised"` if you want the old look.

### 10.5 Cell text wrapping

Table cells no longer wrap text by default. Add `white-space: normal` to restore wrapping behavior.

### 10.6 Typography not applying

In v15+, typography styles are no longer auto-applied. If text looks wrong after migration, add:

```scss
@include mat.typography-hierarchy($your-theme);
```

### 10.7 Don't mix M2 and M3 theme functions

`mat.define-palette()` creates an M2 palette. `mat.define-theme()` expects M3 tonal palettes. Don't pass M2 palettes to M3 theme functions or vice versa.

### 10.8 Chip migration requires manual decisions

The schematic converts all `<mat-chip-list>` to `<mat-chip-listbox>`. You must manually decide whether each instance should actually be `<mat-chip-grid>` (editable with input) or `<mat-chip-set>` (static display).

---

## Reference A: SCSS Theme Conversions (Alphabetical)

Complete alphabetical list of every SCSS function, mixin, and variable that changes from M2 to M3.

| M2 (v15) | M3 (v18) | M3 (v19) | Notes |
|-----------|----------|----------|-------|
| `mat.$amber-palette` | `mat.$m2-amber-palette` | Same | M2 palettes get `m2-` prefix |
| `mat.$blue-grey-palette` | `mat.$m2-blue-grey-palette` | Same | M2 palettes get `m2-` prefix |
| `mat.$blue-palette` | `mat.$m2-blue-palette` | Same | M2 palette; M3 equivalent: `mat.$blue-palette` (tonal) |
| `mat.$brown-palette` | `mat.$m2-brown-palette` | Same | No direct M3 equivalent |
| `mat.$cyan-palette` | `mat.$m2-cyan-palette` | Same | M3 has `mat.$cyan-palette` (tonal) |
| `mat.$deep-orange-palette` | `mat.$m2-deep-orange-palette` | Same | No direct M3 equivalent |
| `mat.$deep-purple-palette` | `mat.$m2-deep-purple-palette` | Same | No direct M3 equivalent; use `mat.$violet-palette` |
| `mat.$green-palette` | `mat.$m2-green-palette` | Same | M3 has `mat.$green-palette` (tonal) |
| `mat.$grey-palette` | `mat.$m2-grey-palette` | Same | No direct M3 equivalent |
| `mat.$indigo-palette` | `mat.$m2-indigo-palette` | Same | No direct M3 equivalent; use `mat.$azure-palette` |
| `mat.$light-blue-palette` | `mat.$m2-light-blue-palette` | Same | No direct M3 equivalent; use `mat.$azure-palette` |
| `mat.$light-green-palette` | `mat.$m2-light-green-palette` | Same | No direct M3 equivalent; use `mat.$chartreuse-palette` |
| `mat.$lime-palette` | `mat.$m2-lime-palette` | Same | No direct M3 equivalent; use `mat.$chartreuse-palette` |
| `mat.$orange-palette` | `mat.$m2-orange-palette` | Same | M3 has `mat.$orange-palette` (tonal) |
| `mat.$pink-palette` | `mat.$m2-pink-palette` | Same | No direct M3 equivalent; use `mat.$rose-palette` |
| `mat.$purple-palette` | `mat.$m2-purple-palette` | Same | No direct M3 equivalent; use `mat.$violet-palette` |
| `mat.$red-palette` | `mat.$m2-red-palette` | Same | M3 has `mat.$red-palette` (tonal) |
| `mat.$teal-palette` | `mat.$m2-teal-palette` | Same | No direct M3 equivalent; use `mat.$spring-green-palette` |
| `mat.$yellow-palette` | `mat.$m2-yellow-palette` | Same | M3 has `mat.$yellow-palette` (tonal) |
| `mat.all-component-colors($theme)` | Same (deprecated) | Removed | Use `mat.theme()` in v19 |
| `mat.all-component-densities($theme)` | Same (deprecated) | Removed | Use `mat.theme()` in v19 |
| `mat.all-component-themes($theme)` | Same (accepts M3 theme) | `mat.theme(config)` | v19 replaces with `mat.theme()` mixin |
| `mat.all-component-typographies($theme)` | Same (deprecated) | Removed | Use `mat.theme()` in v19 |
| `mat.app-background()` | Same | Subsumed by `mat.theme()` | v18-only bridge from `mat.core()` |
| `mat.button-color($theme)` | Same (deprecated) | Use `mat.button-overrides()` | Per-component mixins deprecated in M3 |
| `mat.button-density($theme)` | Same (deprecated) | Use `mat.button-overrides()` | Per-component mixins deprecated in M3 |
| `mat.button-theme($theme)` | Same (accepts M3) | Use `mat.button-overrides()` | Per-component mixins deprecated in M3 |
| `mat.button-typography($theme)` | Same (deprecated) | Use `mat.button-overrides()` | Per-component mixins deprecated in M3 |
| `mat.card-theme($theme)` | Same (accepts M3) | Use `mat.card-overrides()` | Per-component mixins deprecated in M3 |
| `mat.core()` | `mat.elevation-classes()` + `mat.app-background()` | Not needed | Subsumed by `mat.theme()` in v19 |
| `mat.define-dark-theme((...))` | `mat.m2-define-dark-theme((...))` | Same | M3 uses `mat.define-theme()` with `theme-type: dark` |
| `mat.define-light-theme((...))` | `mat.m2-define-light-theme((...))` | Same | M3 uses `mat.define-theme()` with `theme-type: light` |
| `mat.define-palette($map, $default, $lighter, $darker)` | `mat.m2-define-palette(...)` | Same | M3 has no equivalent; use pre-built tonal palettes |
| `mat.define-typography-config(...)` | `mat.m2-define-typography-config(...)` | Same | M3 integrates typography into `define-theme()` / `theme()` |
| `mat.define-typography-level($size, $line-height, $weight)` | `mat.m2-define-typography-level(...)` | Same | M3 type scale is automatic |
| `mat.elevation-classes()` | Same | Subsumed by `mat.theme()` | v18-only bridge from `mat.core()` |
| `mat.font-family($config, $level)` | Removed | N/A | Use `mat.get-theme-typography()` or `var(--mat-sys-*-font)` |
| `mat.font-size($config, $level)` | Removed | N/A | Use `var(--mat-sys-*-size)` |
| `mat.font-weight($config, $level)` | Removed | N/A | Use `var(--mat-sys-*-weight)` |
| `mat.get-color-config($theme)` | Removed | N/A | Use `mat.get-theme-color()` or CSS variables |
| `mat.get-color-from-palette($palette, $hue)` | `mat.m2-get-color-from-palette(...)` | Same | M3 uses `mat.get-theme-color($theme, role)` |
| `mat.get-theme-color($theme, role)` | Same | `var(--mat-sys-role)` preferred | Works with both M2 and M3 themes |
| `mat.get-theme-color($theme, role, tone)` | Same | `var(--mat-sys-role)` preferred | Tone (0-100) only works with M3 |
| `mat.get-theme-density($theme)` | Same | Same | Works with both M2 and M3 |
| `mat.get-theme-type($theme)` | Same | Same | Returns `'light'` or `'dark'` |
| `mat.get-theme-typography($theme, level)` | Same | `var(--mat-sys-level)` preferred | Works with both M2 and M3 |
| `mat.get-typography-config($theme)` | Removed | N/A | Use `mat.get-theme-typography()` or CSS variables |
| `mat.letter-spacing($config, $level)` | Removed | N/A | Use `var(--mat-sys-*-tracking)` |
| `mat.line-height($config, $level)` | Removed | N/A | Use `var(--mat-sys-*-line-height)` |
| `mat.strong-focus-indicators()` | Same | Same | API largely unchanged |
| `mat.strong-focus-indicators-theme($theme)` | Same | Same | Can use `var(--mat-sys-primary)` for color |
| N/A | `mat.<component>-overrides(tokens)` | Same | New in M3: per-component token customization |
| N/A | `mat.define-theme(config)` | `mat.theme(config)` mixin | v18 function → v19 mixin |
| N/A | `mat.system-level-colors($theme)` | Subsumed by `mat.theme()` | v18-only |
| N/A | `mat.system-level-typography($theme)` | Subsumed by `mat.theme()` | v18-only |
| N/A | `mat.theme-overrides(tokens)` | Same | Override `--mat-sys-*` tokens in a scope |
| N/A | `mat.system-classes()` | Same | v19: generates `.mat-bg-*`, `.mat-text-*`, `.mat-font-*` utility classes |
| `mat.typography-hierarchy($config)` | Same | Same | Not recommended; use component-level typography |
| `mat.typography-level($config, $level)` | Removed | N/A | Use `mat.get-theme-typography()` or `var(--mat-sys-level)` |

### M3 Design Token Reference

System-level tokens emitted by `mat.all-component-themes()` (v18) or `mat.theme()` (v19):

**Color tokens** (`--mat-sys-*`):
- `primary`, `on-primary`, `primary-container`, `on-primary-container`
- `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`
- `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container`
- `error`, `on-error`, `error-container`, `on-error-container`
- `surface`, `on-surface`, `on-surface-variant`
- `surface-bright`, `surface-dim`
- `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`
- `outline`, `outline-variant`
- `inverse-surface`, `inverse-on-surface`, `inverse-primary`
- `scrim`, `shadow`

**Typography tokens** (`--mat-sys-*`):
- `display-large`, `display-medium`, `display-small`
- `headline-large`, `headline-medium`, `headline-small`
- `title-large`, `title-medium`, `title-small`
- `body-large`, `body-medium`, `body-small`
- `label-large`, `label-medium`, `label-small`
- Each has sub-tokens: `-font`, `-size`, `-weight`, `-line-height`, `-tracking`

**Elevation tokens**: `--mat-sys-level0` through `--mat-sys-level5`

**Shape tokens**: `--mat-sys-corner-extra-small`, `-small`, `-medium`, `-large`, `-extra-large`, `-full`

**State tokens**: `--mat-sys-hover-state-layer-opacity`, `focus-state-layer-opacity`, `pressed-state-layer-opacity`, `dragged-state-layer-opacity`

---

## Reference B: HTML Template Conversions (Alphabetical)

Complete alphabetical list of every component selector, directive, attribute, and CSS class that changes.

### Selector and Directive Changes

| M2 (v14) | M3/MDC (v18+) | Component | Notes |
|-----------|---------------|-----------|-------|
| `appearance="legacy"` | `appearance="fill"` or `"outline"` | Form Field | Removed |
| `appearance="standard"` | `appearance="fill"` or remove | Form Field | Removed; fill is default |
| `displayValue` (on slider) | `displayWith` (function) | Slider | Custom thumb label formatting |
| `invert` (on slider) | Removed | Slider | No replacement |
| `mat-line` | `matListItemTitle` / `matListItemLine` | List | First line → Title; subsequent → Line |
| `mat-list-avatar` | `matListItemAvatar` | List | |
| `mat-list-icon` | `matListItemIcon` | List | |
| `<mat-chip-list>` | `<mat-chip-listbox>` / `<mat-chip-grid>` / `<mat-chip-set>` | Chips | Choose based on use case |
| `<mat-chip>` (in listbox) | `<mat-chip-option>` | Chips | Selectable chip |
| `<mat-chip>` (in grid) | `<mat-chip-row>` | Chips | Removable chip with input |
| `<mat-slider>` alone | `<mat-slider>` + `<input matSliderThumb>` | Slider | Child input required |
| `matChipRemove` (on `<mat-icon>`) | `matChipRemove` (on `<button>`) | Chips | Must wrap in `<button>` |
| `[matChipInputFor]="chipList"` | `[matChipInputFor]="chipGrid"` | Chips | Variable name change |
| `matPrefix` | `matTextPrefix` or `matIconPrefix` | Form Field | Deprecated; split by alignment |
| `matSuffix` | `matTextSuffix` or `matIconSuffix` | Form Field | Deprecated; split by alignment |
| N/A | `[tabPanel]` on `mat-tab-nav-bar` | Tabs | Required reference to `<mat-tab-nav-panel>` |
| N/A | `<mat-tab-nav-panel>` | Tabs | New element for accessibility |
| N/A | `matListItemMeta` | List | New: trailing metadata |
| N/A | `matSliderEndThumb` | Slider | New: range slider end |
| N/A | `matSliderStartThumb` | Slider | New: range slider start |
| N/A | `matSnackBarAction` | Snack Bar | New: marks action button in custom snack bar |
| N/A | `matSnackBarActions` | Snack Bar | New: wraps action container in custom snack bar |
| N/A | `matSnackBarLabel` | Snack Bar | New: marks text content in custom snack bar |
| `[removable]="true"` | Removed | Chips | Implicit from `matChipRemove` existence |
| `[tickInterval]="N"` | `showTickMarks` | Slider | Ticks now match step |
| `thumbLabel` | `discrete` | Slider | Shows value indicator |
| `vertical` (on slider) | Removed | Slider | No replacement |

### CSS Class Changes (Alphabetical by M2 class)

| M2 CSS Class | M3/MDC CSS Class | Component |
|-------------|-----------------|-----------|
| `.mat-autocomplete-panel` | `.mat-mdc-autocomplete-panel` | Autocomplete |
| `.mat-button` | `.mat-mdc-button` | Button |
| `.mat-button-wrapper` | Removed | Button |
| `.mat-card` | `.mat-mdc-card` | Card |
| `.mat-card-actions` | `.mat-mdc-card-actions` | Card |
| `.mat-card-content` | `.mat-mdc-card-content` | Card |
| `.mat-card-footer` | `.mat-mdc-card-footer` | Card |
| `.mat-card-header` | `.mat-mdc-card-header` | Card |
| `.mat-card-subtitle` | `.mat-mdc-card-subtitle` | Card |
| `.mat-card-title` | `.mat-mdc-card-title` | Card |
| `.mat-cell` | `.mat-mdc-cell` | Table |
| `.mat-checkbox` | `.mat-mdc-checkbox` | Checkbox |
| `.mat-checkbox-background` | `.mdc-checkbox__background` | Checkbox |
| `.mat-checkbox-checked` | `.mat-mdc-checkbox-checked` | Checkbox |
| `.mat-checkbox-checkmark` | `.mdc-checkbox__checkmark` | Checkbox |
| `.mat-checkbox-frame` | `.mdc-checkbox__background` | Checkbox |
| `.mat-checkbox-inner-container` | `.mdc-checkbox` | Checkbox |
| `.mat-checkbox-label` | `.mdc-label` | Checkbox |
| `.mat-checkbox-layout` | Removed | Checkbox |
| `.mat-chip` | `.mat-mdc-chip` | Chips |
| `.mat-chip-list` | `.mat-mdc-chip-listbox` / `-grid` / `-set` | Chips |
| `.mat-chip-remove` | `.mat-mdc-chip-remove` | Chips |
| `.mat-dialog-actions` | `.mat-mdc-dialog-actions` | Dialog |
| `.mat-dialog-container` | `.mat-mdc-dialog-container` | Dialog |
| `.mat-dialog-content` | `.mat-mdc-dialog-content` | Dialog |
| `.mat-dialog-title` | `.mat-mdc-dialog-title` | Dialog |
| `.mat-fab` | `.mat-mdc-fab` | Button |
| `.mat-flat-button` | `.mat-mdc-unelevated-button` | Button |
| `.mat-footer-cell` | `.mat-mdc-footer-cell` | Table |
| `.mat-footer-row` | `.mat-mdc-footer-row` | Table |
| `.mat-form-field` | `.mat-mdc-form-field` | Form Field |
| `.mat-form-field-flex` | `.mat-mdc-text-field-wrapper` | Form Field |
| `.mat-form-field-infix` | `.mat-mdc-form-field-infix` | Form Field |
| `.mat-form-field-label` | `.mat-mdc-floating-label` | Form Field |
| `.mat-form-field-prefix` | `.mat-mdc-form-field-text-prefix` / `-icon-prefix` | Form Field |
| `.mat-form-field-subscript-wrapper` | `.mat-mdc-form-field-subscript-wrapper` | Form Field |
| `.mat-form-field-suffix` | `.mat-mdc-form-field-text-suffix` / `-icon-suffix` | Form Field |
| `.mat-form-field-underline` | `.mdc-line-ripple` | Form Field |
| `.mat-form-field-wrapper` | `.mat-mdc-text-field-wrapper` | Form Field |
| `.mat-header-cell` | `.mat-mdc-header-cell` | Table |
| `.mat-header-row` | `.mat-mdc-header-row` | Table |
| `.mat-icon-button` | `.mat-mdc-icon-button` | Button |
| `.mat-input-element` | `.mat-mdc-input-element` | Input |
| `.mat-list` | `.mat-mdc-list` | List |
| `.mat-list-item` | `.mat-mdc-list-item` | List |
| `.mat-list-item-avatar` | `.mat-mdc-list-item-avatar` | List |
| `.mat-list-option` | `.mat-mdc-list-option` | List |
| `.mat-menu-content` | `.mat-mdc-menu-content` | Menu |
| `.mat-menu-item` | `.mat-mdc-menu-item` | Menu |
| `.mat-menu-panel` | `.mat-mdc-menu-panel` | Menu |
| `.mat-mini-fab` | `.mat-mdc-mini-fab` | Button |
| `.mat-nav-list` | `.mat-mdc-nav-list` | List |
| `.mat-optgroup` | `.mat-mdc-optgroup` | Select/Autocomplete |
| `.mat-option` | `.mat-mdc-option` | Select/Autocomplete |
| `.mat-paginator` | `.mat-mdc-paginator` | Paginator |
| `.mat-progress-bar` | `.mat-mdc-progress-bar` | Progress Bar |
| `.mat-progress-spinner` | `.mat-mdc-progress-spinner` | Progress Spinner |
| `.mat-radio-button` | `.mat-mdc-radio-button` | Radio |
| `.mat-radio-checked` | `.mat-mdc-radio-checked` | Radio |
| `.mat-radio-container` | `.mdc-radio` | Radio |
| `.mat-radio-group` | `.mat-mdc-radio-group` | Radio |
| `.mat-radio-inner-circle` | `.mdc-radio__inner-circle` | Radio |
| `.mat-radio-label-content` | `.mdc-label` | Radio |
| `.mat-radio-outer-circle` | `.mdc-radio__outer-circle` | Radio |
| `.mat-raised-button` | `.mat-mdc-raised-button` | Button |
| `.mat-row` | `.mat-mdc-row` | Table |
| `.mat-select` | `.mat-mdc-select` | Select |
| `.mat-select-arrow` | `.mat-mdc-select-arrow` | Select |
| `.mat-select-panel` | `.mat-mdc-select-panel` | Select |
| `.mat-select-trigger` | `.mat-mdc-select-trigger` | Select |
| `.mat-select-value` | `.mat-mdc-select-value` | Select |
| `.mat-selection-list` | `.mat-mdc-selection-list` | List |
| `.mat-slide-toggle` | `.mat-mdc-slide-toggle` | Slide Toggle |
| `.mat-slide-toggle-bar` | `.mdc-switch__track` | Slide Toggle |
| `.mat-slide-toggle-content` | `.mdc-label` | Slide Toggle |
| `.mat-slide-toggle-thumb` | `.mdc-switch__handle` | Slide Toggle |
| `.mat-slider` | `.mat-mdc-slider` | Slider |
| `.mat-slider-thumb` | `.mdc-slider__thumb` | Slider |
| `.mat-slider-track` | `.mdc-slider__track` | Slider |
| `.mat-snack-bar-container` | `.mat-mdc-snack-bar-container` | Snack Bar |
| `.mat-spinner` | `.mat-mdc-progress-spinner` | Progress Spinner |
| `.mat-stroked-button` | `.mat-mdc-outlined-button` | Button |
| `.mat-tab-body` | `.mat-mdc-tab-body` | Tabs |
| `.mat-tab-group` | `.mat-mdc-tab-group` | Tabs |
| `.mat-tab-header` | `.mat-mdc-tab-header` | Tabs |
| `.mat-tab-label` | `.mat-mdc-tab` | Tabs |
| `.mat-tab-label-active` | `.mdc-tab--active` | Tabs |
| `.mat-tab-link` | `.mat-mdc-tab-link` | Tabs |
| `.mat-tab-list` | `.mat-mdc-tab-list` | Tabs |
| `.mat-tab-nav-bar` | `.mat-mdc-tab-nav-bar` | Tabs |
| `.mat-table` | `.mat-mdc-table` | Table |
| `.mat-tooltip` | `.mat-mdc-tooltip` | Tooltip |

### Components NOT Part of MDC Migration (CSS classes unchanged)

These components kept their original `.mat-*` classes across all versions:

- Badge (`.mat-badge`, `.mat-badge-content`)
- Bottom Sheet
- Button Toggle
- Datepicker
- Divider
- Expansion Panel
- Icon
- Ripple
- Sidenav / Drawer
- Sort Header (`.mat-sort-header-arrow`)
- Stepper
- Toolbar
- Tree

### Legacy Module to MDC Module Reference

| Legacy Module (v15-v16) | MDC Replacement (v17+) | Import Path |
|------------------------|----------------------|-------------|
| `MatLegacyAutocompleteModule` | `MatAutocompleteModule` | `@angular/material/autocomplete` |
| `MatLegacyButtonModule` | `MatButtonModule` | `@angular/material/button` |
| `MatLegacyCardModule` | `MatCardModule` | `@angular/material/card` |
| `MatLegacyCheckboxModule` | `MatCheckboxModule` | `@angular/material/checkbox` |
| `MatLegacyChipsModule` | `MatChipsModule` | `@angular/material/chips` |
| `MatLegacyCoreModule` | `MatCoreModule` | `@angular/material/core` |
| `MatLegacyDialogModule` | `MatDialogModule` | `@angular/material/dialog` |
| `MatLegacyFormFieldModule` | `MatFormFieldModule` | `@angular/material/form-field` |
| `MatLegacyInputModule` | `MatInputModule` | `@angular/material/input` |
| `MatLegacyListModule` | `MatListModule` | `@angular/material/list` |
| `MatLegacyMenuModule` | `MatMenuModule` | `@angular/material/menu` |
| `MatLegacyPaginatorModule` | `MatPaginatorModule` | `@angular/material/paginator` |
| `MatLegacyProgressBarModule` | `MatProgressBarModule` | `@angular/material/progress-bar` |
| `MatLegacyProgressSpinnerModule` | `MatProgressSpinnerModule` | `@angular/material/progress-spinner` |
| `MatLegacyRadioModule` | `MatRadioModule` | `@angular/material/radio` |
| `MatLegacySelectModule` | `MatSelectModule` | `@angular/material/select` |
| `MatLegacySlideToggleModule` | `MatSlideToggleModule` | `@angular/material/slide-toggle` |
| `MatLegacySliderModule` | `MatSliderModule` | `@angular/material/slider` |
| `MatLegacySnackBarModule` | `MatSnackBarModule` | `@angular/material/snack-bar` |
| `MatLegacyTableModule` | `MatTableModule` | `@angular/material/table` |
| `MatLegacyTabsModule` | `MatTabsModule` | `@angular/material/tabs` |
| `MatLegacyTooltipModule` | `MatTooltipModule` | `@angular/material/tooltip` |

### Quick Search Patterns for Template Migration

When migrating a codebase, search for these patterns that require manual template changes:

| Search For | Replace With |
|-----------|-------------|
| `<mat-chip-list` | `<mat-chip-listbox>`, `<mat-chip-grid>`, or `<mat-chip-set>` |
| `<mat-chip>` inside chip-list | `<mat-chip-option>`, `<mat-chip-row>`, or keep `<mat-chip>` |
| `matChipRemove` on `<mat-icon>` | Wrap icon with `<button matChipRemove>` |
| `appearance="legacy"` | `appearance="fill"` or `appearance="outline"` |
| `appearance="standard"` | `appearance="fill"` or remove entirely |
| `matPrefix` | `matTextPrefix` or `matIconPrefix` |
| `matSuffix` | `matTextSuffix` or `matIconSuffix` |
| `mat-line` | `matListItemTitle` (first) / `matListItemLine` (subsequent) |
| `mat-list-icon` | `matListItemIcon` |
| `mat-list-avatar` | `matListItemAvatar` |
| `<mat-slider` without child input | Add `<input matSliderThumb>` child |
| `thumbLabel` | `discrete` |
| `tickInterval` | `showTickMarks` |
| `vertical` on mat-slider | Remove (no longer supported) |
| `invert` on mat-slider | Remove (no longer supported) |
| `<nav mat-tab-nav-bar>` without `[tabPanel]` | Add `[tabPanel]` and `<mat-tab-nav-panel>` |
| Missing `<mat-label>` in form fields | Add `<mat-label>` (now required) |
| Custom snack bar without structural directives | Add `matSnackBarLabel`, `matSnackBarActions`, `matSnackBarAction` |
