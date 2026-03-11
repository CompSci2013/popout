# Angular Material Migration Manual: v14 → v15

> **What this version changes**: Component internals are rebuilt on MDC-Web. The design system stays Material Design 2. Your SCSS theming API stays the same. CSS class names and DOM structure change.

---

## Step 1: Update Angular and Material

```bash
# Update Angular core to v15
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 --allow-dirty --force

# Update Material + CDK (auto-applies legacy aliases)
npx @angular/cli@15 update @angular/material@15 --allow-dirty --force

# Verify build
ng build
```

After the Material update, the schematic automatically rewrites your imports to legacy aliases:

```typescript
// BEFORE (v14)
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

// AFTER (v15 — legacy aliases applied by schematic)
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
```

Your app builds and runs. It's using the old (legacy) component implementations behind aliased names. Nothing looks different yet.

---

## Step 2: Run the MDC Migration Schematic

This converts your legacy imports to the new MDC-based components:

```bash
ng generate @angular/material:mdc-migration
```

The schematic does three things:
1. Removes `Legacy` prefixes and `legacy-` import paths
2. Updates templates where it can
3. Adds `/* TODO(mdc-migration): */` comments in your SCSS for things it can't auto-fix

After running, find all the TODOs:

```bash
grep -r "TODO(mdc-migration)" src/
```

---

## Step 3: Fix SCSS — CSS Class Name Changes

MDC-based components use different CSS class names in the rendered DOM. If your SCSS targets Material's internal classes (especially via `::ng-deep`), those selectors need updating.

### The General Pattern

Most classes get `-mdc-` inserted after `mat`:

```
.mat-header-row  →  .mat-mdc-header-row
.mat-cell        →  .mat-mdc-cell
.mat-button      →  .mat-mdc-button
```

**But some classes are renamed entirely.** Don't blindly find-and-replace `.mat-` → `.mat-mdc-`.

### Complete CSS Class Changes (by component)

#### Autocomplete

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-autocomplete-panel` | `.mat-mdc-autocomplete-panel` |
| `.mat-option` | `.mat-mdc-option` |
| `.mat-optgroup` | `.mat-mdc-optgroup` |

#### Button

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-button` | `.mat-mdc-button` |
| `.mat-raised-button` | `.mat-mdc-raised-button` |
| `.mat-flat-button` | `.mat-mdc-unelevated-button` |
| `.mat-stroked-button` | `.mat-mdc-outlined-button` |
| `.mat-icon-button` | `.mat-mdc-icon-button` |
| `.mat-fab` | `.mat-mdc-fab` |
| `.mat-mini-fab` | `.mat-mdc-mini-fab` |
| `.mat-button-wrapper` | **Removed** (no wrapper element in MDC) |

> `.mat-flat-button` → `.mat-mdc-unelevated-button` and `.mat-stroked-button` → `.mat-mdc-outlined-button` are full renames, not just `-mdc-` insertion.

#### Card

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-card` | `.mat-mdc-card` |
| `.mat-card-header` | `.mat-mdc-card-header` |
| `.mat-card-title` | `.mat-mdc-card-title` |
| `.mat-card-subtitle` | `.mat-mdc-card-subtitle` |
| `.mat-card-content` | `.mat-mdc-card-content` |
| `.mat-card-actions` | `.mat-mdc-card-actions` |
| `.mat-card-footer` | `.mat-mdc-card-footer` |

#### Checkbox

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-checkbox` | `.mat-mdc-checkbox` |
| `.mat-checkbox-frame` | `.mdc-checkbox__background` |
| `.mat-checkbox-background` | `.mdc-checkbox__background` |
| `.mat-checkbox-checkmark` | `.mdc-checkbox__checkmark` |
| `.mat-checkbox-label` | `.mdc-label` |
| `.mat-checkbox-checked` | `.mat-mdc-checkbox-checked` |
| `.mat-checkbox-layout` | **Removed** |
| `.mat-checkbox-inner-container` | `.mdc-checkbox` |

#### Chips

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-chip-list` | `.mat-mdc-chip-listbox` / `.mat-mdc-chip-grid` / `.mat-mdc-chip-set` |
| `.mat-chip` | `.mat-mdc-chip` |
| `.mat-chip-remove` | `.mat-mdc-chip-remove` |

#### Dialog

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-dialog-container` | `.mat-mdc-dialog-container` |
| `.mat-dialog-title` | `.mat-mdc-dialog-title` |
| `.mat-dialog-content` | `.mat-mdc-dialog-content` |
| `.mat-dialog-actions` | `.mat-mdc-dialog-actions` |

#### Form Field

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-form-field` | `.mat-mdc-form-field` |
| `.mat-form-field-wrapper` | `.mat-mdc-text-field-wrapper` |
| `.mat-form-field-flex` | `.mat-mdc-text-field-wrapper` |
| `.mat-form-field-infix` | `.mat-mdc-form-field-infix` |
| `.mat-form-field-label` | `.mat-mdc-floating-label` |
| `.mat-form-field-underline` | `.mdc-line-ripple` |
| `.mat-form-field-prefix` | `.mat-mdc-form-field-text-prefix` / `.mat-mdc-form-field-icon-prefix` |
| `.mat-form-field-suffix` | `.mat-mdc-form-field-text-suffix` / `.mat-mdc-form-field-icon-suffix` |
| `.mat-form-field-subscript-wrapper` | `.mat-mdc-form-field-subscript-wrapper` |

#### Input

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-input-element` | `.mat-mdc-input-element` |

#### List

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-list` | `.mat-mdc-list` |
| `.mat-list-item` | `.mat-mdc-list-item` |
| `.mat-list-item-avatar` | `.mat-mdc-list-item-avatar` |
| `.mat-nav-list` | `.mat-mdc-nav-list` |
| `.mat-selection-list` | `.mat-mdc-selection-list` |
| `.mat-list-option` | `.mat-mdc-list-option` |

#### Menu

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-menu-panel` | `.mat-mdc-menu-panel` |
| `.mat-menu-item` | `.mat-mdc-menu-item` |
| `.mat-menu-content` | `.mat-mdc-menu-content` |

#### Paginator

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-paginator` | `.mat-mdc-paginator` |
| `.mat-paginator-range-label` | `.mat-mdc-paginator-range-label` |
| `.mat-paginator-page-size-label` | `.mat-mdc-paginator-page-size-label` |

#### Progress Bar

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-progress-bar` | `.mat-mdc-progress-bar` |

#### Progress Spinner

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-progress-spinner` | `.mat-mdc-progress-spinner` |
| `.mat-spinner` | `.mat-mdc-progress-spinner` |

#### Radio Button

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-radio-group` | `.mat-mdc-radio-group` |
| `.mat-radio-button` | `.mat-mdc-radio-button` |
| `.mat-radio-outer-circle` | `.mdc-radio__outer-circle` |
| `.mat-radio-inner-circle` | `.mdc-radio__inner-circle` |
| `.mat-radio-label-content` | `.mdc-label` |
| `.mat-radio-checked` | `.mat-mdc-radio-checked` |
| `.mat-radio-container` | `.mdc-radio` |

#### Select

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-select` | `.mat-mdc-select` |
| `.mat-select-trigger` | `.mat-mdc-select-trigger` |
| `.mat-select-value` | `.mat-mdc-select-value` |
| `.mat-select-panel` | `.mat-mdc-select-panel` |
| `.mat-select-arrow` | `.mat-mdc-select-arrow` |

#### Slide Toggle

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-slide-toggle` | `.mat-mdc-slide-toggle` |
| `.mat-slide-toggle-bar` | `.mdc-switch__track` |
| `.mat-slide-toggle-thumb` | `.mdc-switch__handle` |
| `.mat-slide-toggle-content` | `.mdc-label` |

#### Slider

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-slider` | `.mat-mdc-slider` |
| `.mat-slider-thumb` | `.mdc-slider__thumb` |
| `.mat-slider-track` | `.mdc-slider__track` |

#### Snack Bar

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-snack-bar-container` | `.mat-mdc-snack-bar-container` |

#### Table

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-table` | `.mat-mdc-table` |
| `.mat-header-cell` | `.mat-mdc-header-cell` |
| `.mat-cell` | `.mat-mdc-cell` |
| `.mat-header-row` | `.mat-mdc-header-row` |
| `.mat-row` | `.mat-mdc-row` |
| `.mat-footer-cell` | `.mat-mdc-footer-cell` |
| `.mat-footer-row` | `.mat-mdc-footer-row` |

#### Tabs

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-tab-group` | `.mat-mdc-tab-group` |
| `.mat-tab-label` | `.mat-mdc-tab` |
| `.mat-tab-label-active` | `.mdc-tab--active` |
| `.mat-tab-list` | `.mat-mdc-tab-list` |
| `.mat-tab-body` | `.mat-mdc-tab-body` |
| `.mat-tab-header` | `.mat-mdc-tab-header` |
| `.mat-tab-link` | `.mat-mdc-tab-link` |
| `.mat-tab-nav-bar` | `.mat-mdc-tab-nav-bar` |

#### Tooltip

| v14 Class | v15 MDC Class |
|-----------|--------------|
| `.mat-tooltip` | `.mat-mdc-tooltip` |

### Components with NO CSS class changes

These components were **not** part of the MDC migration. Their CSS classes stay the same:

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

### Example: Updating a data table's custom SCSS

```scss
// BEFORE (v14)
:host ::ng-deep .themed-mat-table {
  .mat-header-row {
    background: var(--theme-table-header-bg) !important;
  }
  .mat-header-cell {
    color: var(--theme-table-header-text) !important;
    .mat-sort-header-arrow {
      color: var(--theme-text-muted) !important;
    }
  }
  .mat-row {
    background: var(--theme-table-row-bg) !important;
    &:nth-child(even) {
      background: var(--theme-table-row-alt-bg) !important;
    }
  }
  .mat-cell {
    color: var(--theme-table-cell-text) !important;
  }
}

// AFTER (v15)
:host ::ng-deep .themed-mat-table {
  .mat-mdc-header-row {                          // ← changed
    background: var(--theme-table-header-bg) !important;
  }
  .mat-mdc-header-cell {                         // ← changed
    color: var(--theme-table-header-text) !important;
    .mat-sort-header-arrow {                     // ← NOT changed (sort is not MDC)
      color: var(--theme-text-muted) !important;
    }
  }
  .mat-mdc-row {                                 // ← changed
    background: var(--theme-table-row-bg) !important;
    &:nth-child(even) {
      background: var(--theme-table-row-alt-bg) !important;
    }
  }
  .mat-mdc-cell {                                // ← changed
    color: var(--theme-table-cell-text) !important;
  }
}
```

Notice `.mat-sort-header-arrow` does NOT change — MatSort was not part of the MDC migration.

---

## Step 4: Fix HTML Templates

Most template selectors (`mat-table`, `mat-sort-header`, `mat-paginator`, `mat-button`, etc.) are **unchanged**. The migration schematic handles the few that need updating.

However, six components have template changes that require manual attention:

### 4.1 Chips — Complete Restructure

This is the biggest template change in v15.

```html
<!-- BEFORE (v14) — single pattern -->
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

<!-- AFTER (v15) — three distinct patterns -->

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
    <button matChipRemove>
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

**What changed**:
- `<mat-chip-list>` splits into `<mat-chip-listbox>`, `<mat-chip-grid>`, or `<mat-chip-set>` depending on use case
- `<mat-chip>` becomes `<mat-chip-option>` (in listbox) or `<mat-chip-row>` (in grid)
- `matChipRemove` must be on a `<button>`, not directly on `<mat-icon>`
- `[removable]` input removed — removability is implicit from having a `matChipRemove` button
- The schematic always converts to `<mat-chip-listbox>`. You must manually decide if `<mat-chip-grid>` or `<mat-chip-set>` is correct.

### 4.2 Slider — Now Requires Child Input

```html
<!-- BEFORE (v14) -->
<mat-slider [min]="0" [max]="100" [(ngModel)]="value" thumbLabel></mat-slider>
<mat-slider [min]="0" [max]="100" [tickInterval]="10" thumbLabel></mat-slider>
<mat-slider vertical [min]="0" [max]="100"></mat-slider>

<!-- AFTER (v15) -->
<mat-slider [min]="0" [max]="100" discrete>
  <input matSliderThumb [(ngModel)]="value">
</mat-slider>
<mat-slider [min]="0" [max]="100" [step]="10" showTickMarks discrete>
  <input matSliderThumb>
</mat-slider>
<!-- vertical and invert: PERMANENTLY REMOVED, no replacement -->
```

**What changed**:
- `[(ngModel)]`, `[value]`, `(change)` move from `<mat-slider>` to child `<input matSliderThumb>`
- `thumbLabel` → `discrete`
- `[tickInterval]` → `showTickMarks` (ticks now match step interval)
- `vertical` and `invert` properties are permanently removed
- Range sliders are now possible with `matSliderStartThumb` + `matSliderEndThumb`

### 4.3 Form Field — Appearance and Prefix/Suffix Changes

```html
<!-- BEFORE (v14) -->
<mat-form-field appearance="standard">
  <input matInput placeholder="Name">
  <span matPrefix>$</span>
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>

<!-- AFTER (v15) -->
<mat-form-field appearance="fill">
  <mat-label>Name</mat-label>
  <input matInput placeholder="Name">
  <span matTextPrefix>$&nbsp;</span>
  <mat-icon matIconSuffix>search</mat-icon>
</mat-form-field>
```

**What changed**:
- `appearance="legacy"` and `appearance="standard"` are **removed**. Use `"fill"` (default) or `"outline"`.
- `<mat-label>` is now **required** for accessibility. Placeholders no longer promote to floating labels.
- `matPrefix` → `matTextPrefix` (text aligned to baseline) or `matIconPrefix` (icon centered)
- `matSuffix` → `matTextSuffix` or `matIconSuffix`
- `matPrefix`/`matSuffix` still work but are deprecated (they behave like `matIconPrefix`/`matIconSuffix`)
- New `subscriptSizing` input: `'fixed'` (default, reserves space) or `'dynamic'` (expands/contracts)

### 4.4 List — New Structural Directives

```html
<!-- BEFORE (v14) -->
<mat-list>
  <mat-list-item>
    <mat-icon mat-list-icon>folder</mat-icon>
    <span mat-line>First line</span>
    <span mat-line>Second line</span>
  </mat-list-item>
</mat-list>

<!-- AFTER (v15) -->
<mat-list>
  <mat-list-item>
    <mat-icon matListItemIcon>folder</mat-icon>
    <span matListItemTitle>First line</span>
    <span matListItemLine>Second line</span>
  </mat-list-item>
</mat-list>
```

**What changed**:
- `mat-list-icon` → `matListItemIcon`
- `mat-list-avatar` → `matListItemAvatar`
- `mat-line` → `matListItemTitle` (first line) / `matListItemLine` (subsequent lines)
- New: `matListItemMeta` for trailing metadata
- The schematic does **not** auto-convert these. You must do it manually.

### 4.5 Tabs — Nav Bar Requires Panel Reference

```html
<!-- BEFORE (v14) -->
<nav mat-tab-nav-bar>
  <a mat-tab-link *ngFor="let link of links"
     [routerLink]="link.path" [active]="rla.isActive"
     routerLinkActive #rla="routerLinkActive">
    {{ link.label }}
  </a>
</nav>
<div>Routed content here</div>

<!-- AFTER (v15) -->
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

**What changed**:
- `[tabPanel]` input on `mat-tab-nav-bar` is now **required**
- New `<mat-tab-nav-panel>` element wraps the content (for accessibility/ARIA)
- Tab headers stretch to fill container width by default. Set `[mat-stretch-tabs]="false"` to restore old behavior.

### 4.6 Snack Bar — Custom Snack Bars Need Structural Directives

Simple text snack bars (`snackBar.open('message', 'action')`) need no changes.

Custom snack bar components do:

```html
<!-- BEFORE (v14) — custom snack bar template -->
<div>
  <span>{{ message }}</span>
  <button mat-button (click)="dismiss()">Dismiss</button>
</div>

<!-- AFTER (v15) -->
<div>
  <span matSnackBarLabel>{{ message }}</span>
  <span matSnackBarActions>
    <button mat-button matSnackBarAction (click)="dismiss()">Dismiss</button>
  </span>
</div>
```

---

## Step 5: Handle Visual Differences

MDC-based components render with different defaults. These are not bugs:

| Change | Details |
|--------|---------|
| **Table cell padding** | Now 16px left and right (was variable) |
| **Table row height** | Now 52px (was 48px) |
| **Table header cells** | Same color and text size as data rows (were grayer and smaller) |
| **Table cell text wrapping** | No longer wraps by default. Add `white-space: normal` to restore. |
| **Dialog padding** | `.mat-dialog-container` no longer has 24px padding. The structural directives (`mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`) now own their own padding. Dialogs without these directives lose all padding. |
| **Form field height** | Taller. Horizontal padding increased from 8px to 16px. |
| **Slide toggle** | Now uses `<button role="switch">` instead of `<input type="checkbox">`. No longer responds to native form validation. Touch target is much larger. |
| **Button ripple** | Ripples persist after click instead of animating out. |
| **Touch targets** | Larger for accessibility. Allow more space to prevent overlap. |
| **Typography** | No longer auto-applied. If text looks wrong, add `@include mat.typography-hierarchy($theme);` |

---

## SCSS Theming API — No Changes

The SCSS theming API is **unchanged** in v15. You continue to use:

```scss
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent:  mat.define-palette(mat.$pink-palette, A200);
$my-theme:   mat.define-dark-theme((
  color: (primary: $my-primary, accent: $my-accent, warn: mat.define-palette(mat.$red-palette)),
  typography: $my-typography,
  density: 0,
));

@include mat.all-component-themes($my-theme);

body.light-theme {
  @include mat.all-component-colors($light-theme);
}
```

All `mat.define-palette()`, `mat.define-dark-theme()`, `mat.define-light-theme()`, `mat.all-component-themes()`, `mat.all-component-colors()`, `mat.get-color-from-palette()`, `mat.core()` — everything stays the same.

The only SCSS work in v15 is updating CSS class selectors in your component SCSS files (Step 3).

---

## Quick Search Patterns

Search your codebase for these patterns to find everything that needs manual attention:

```bash
# Find TODO comments from the migration schematic
grep -r "TODO(mdc-migration)" src/

# Find chip-list usage (needs manual decision on replacement)
grep -r "mat-chip-list" src/ --include="*.html"

# Find slider usage (needs child input)
grep -r "<mat-slider" src/ --include="*.html"

# Find form field appearances that are removed
grep -r 'appearance="legacy"\|appearance="standard"' src/ --include="*.html"

# Find old prefix/suffix directives
grep -r "matPrefix\|matSuffix" src/ --include="*.html"

# Find old list directives
grep -r "mat-list-icon\|mat-list-avatar\|mat-line" src/ --include="*.html"

# Find tab nav bars without tabPanel
grep -r "mat-tab-nav-bar" src/ --include="*.html"

# Find custom snack bar components
grep -r "matSnackBarLabel\|snack-bar" src/ --include="*.html"

# Find v14 CSS classes in SCSS (potential broken selectors)
grep -r "\.mat-header-row\|\.mat-header-cell\|\.mat-row\b\|\.mat-cell\b" src/ --include="*.scss"
grep -r "\.mat-button\b\|\.mat-raised-button\|\.mat-flat-button" src/ --include="*.scss"
grep -r "\.mat-form-field-flex\|\.mat-form-field-wrapper\|\.mat-input-element" src/ --include="*.scss"
grep -r "\.mat-tab-label\b\|\.mat-tab-label-active" src/ --include="*.scss"
grep -r "\.mat-checkbox-layout\|\.mat-checkbox-inner-container" src/ --include="*.scss"
grep -r "\.mat-slide-toggle-bar\|\.mat-slide-toggle-thumb" src/ --include="*.scss"
```

---

## Checklist

- [ ] Run `ng update` for Angular core and Material
- [ ] Run `ng generate @angular/material:mdc-migration`
- [ ] Fix all `TODO(mdc-migration)` comments in SCSS
- [ ] Update CSS class selectors in component SCSS files
- [ ] Convert `<mat-chip-list>` to appropriate variant (`listbox`, `grid`, or `set`)
- [ ] Add child `<input matSliderThumb>` to all `<mat-slider>` elements
- [ ] Replace `appearance="legacy"` and `appearance="standard"` with `"fill"` or `"outline"`
- [ ] Replace `matPrefix`/`matSuffix` with `matTextPrefix`/`matIconPrefix`/`matTextSuffix`/`matIconSuffix`
- [ ] Add `<mat-label>` to all form fields that rely on placeholder-as-label
- [ ] Update list item directives (`mat-line` → `matListItemTitle`/`matListItemLine`, etc.)
- [ ] Add `[tabPanel]` and `<mat-tab-nav-panel>` to tab nav bars
- [ ] Add structural directives to custom snack bar components
- [ ] Test visual rendering — adjust spacing/padding as needed
- [ ] Run `ng build` and verify no errors
