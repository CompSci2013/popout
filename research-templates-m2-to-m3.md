# Angular Material: M2 to M3 Template Conversion Reference

> **Scope**: Every Angular Material component selector, directive, attribute, and CSS class
> change when migrating from Material Design 2 (v14/v15) to Material Design 3 (v18+).
>
> **Migration path**: v14 (M2) -> v15 (MDC migration, legacy imports) -> v17 (legacy removed) -> v18 (M3 stable) -> v19+ (M3 refinements)
>
> **Key concept**: The MDC migration (v15) changed DOM structure and CSS classes. The M3
> migration (v17 experimental, v18 stable) changed theming but kept the MDC selectors.
> Template-level changes happened primarily during the MDC migration. M3 is mostly a
> theming/SCSS concern, not a template concern. This document covers both.

---

## Timeline Summary

| Version | What Happened |
|---------|---------------|
| v14     | Pure M2 components. All classes use `mat-*` prefix. |
| v15     | MDC-based components introduced. Old components moved to `MatLegacy*` imports. CSS classes changed to `mat-mdc-*`. Major template changes for Chips, Slider, Snack Bar, List, Tabs. |
| v16     | Legacy imports still available but deprecated. |
| v17     | **Legacy imports removed.** MDC is the only implementation. M3 theming available as experimental. |
| v18     | M3 theming becomes stable. No new template-level changes. |
| v19     | Timepicker added. `--sys` CSS vars renamed to `--mat-sys`. Minor API removals. |

---

## How to Read Each Entry

- **M2 Template**: What your v14/v15 legacy code looks like
- **M3 Template**: What your v18+ code should look like (post-MDC migration)
- **CSS Classes**: DOM class changes in rendered output
- **Notes**: Behavioral or structural changes

---

## Components (Alphabetical)

---

### Autocomplete

**Template selectors**: No change. `<mat-autocomplete>` and `[matAutocomplete]` remain the same.

**M2 Template (v14)**:
```html
<mat-form-field>
  <input matInput [matAutocomplete]="auto">
  <mat-autocomplete #auto="matAutocomplete">
    <mat-option *ngFor="let option of options" [value]="option">
      {{ option }}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
```

**M3 Template (v18+)**:
```html
<!-- Identical selector structure. Must migrate with form-field, input, and select as a group. -->
<mat-form-field>
  <mat-label>Pick one</mat-label>  <!-- mat-label now REQUIRED -->
  <input matInput [matAutocomplete]="auto">
  <mat-autocomplete #auto="matAutocomplete">
    <mat-option *ngFor="let option of options" [value]="option">
      {{ option }}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-autocomplete-panel` | `.mat-mdc-autocomplete-panel` |
| `.mat-option` | `.mat-mdc-option` |
| `.mat-optgroup` | `.mat-mdc-optgroup` |

**Notes**:
- Must be migrated together with Form Field, Input, and Select (they share internal dependencies).
- TypeScript API is largely unchanged.

---

### Badge

**Template selectors**: No change. `[matBadge]` directive remains the same.

**M2 Template (v14)**:
```html
<span matBadge="4" matBadgeOverlap="false">Text</span>
```

**M3 Template (v18+)**:
```html
<!-- Identical. Badge was NOT part of the MDC migration. -->
<span matBadge="4" matBadgeOverlap="false">Text</span>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-badge` | `.mat-badge` (unchanged) |
| `.mat-badge-content` | `.mat-badge-content` (unchanged) |

**Notes**:
- Badge was **not** migrated to MDC. It kept its original implementation.
- In v19, color variants support was added for badge.

---

### Bottom Sheet

**Template selectors**: No change. Opened programmatically via `MatBottomSheet.open()`.

**M2 Template (v14)**:
```html
<!-- Opened via service, no template selector changes -->
```

**M3 Template (v18+)**:
```html
<!-- Same. Not part of MDC migration. -->
```

**Notes**:
- Not part of the MDC migration. Implementation remained the same.
- In v19, the `matBottomSheet` animations symbol was removed.

---

### Button

**Template selectors**: No change. `mat-button`, `mat-raised-button`, `mat-flat-button`, `mat-stroked-button`, `mat-icon-button`, `mat-fab`, `mat-mini-fab` all remain the same attribute selectors.

**M2 Template (v14)**:
```html
<button mat-button>Basic</button>
<button mat-raised-button color="primary">Raised</button>
<button mat-flat-button color="accent">Flat</button>
<button mat-stroked-button>Stroked</button>
<button mat-icon-button>
  <mat-icon>favorite</mat-icon>
</button>
<button mat-fab>
  <mat-icon>add</mat-icon>
</button>
<button mat-mini-fab color="warn">
  <mat-icon>edit</mat-icon>
</button>
```

**M3 Template (v18+)**:
```html
<!-- Selectors identical. color="primary" still works but M3 theming uses design tokens. -->
<button mat-button>Basic</button>
<button mat-raised-button color="primary">Raised</button>
<button mat-flat-button color="accent">Flat</button>
<button mat-stroked-button>Stroked</button>
<button mat-icon-button>
  <mat-icon>favorite</mat-icon>
</button>
<button mat-fab>
  <mat-icon>add</mat-icon>
</button>
<button mat-mini-fab color="warn">
  <mat-icon>edit</mat-icon>
</button>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-button` | `.mat-mdc-button` |
| `.mat-raised-button` | `.mat-mdc-raised-button` |
| `.mat-flat-button` | `.mat-mdc-unelevated-button` |
| `.mat-stroked-button` | `.mat-mdc-outlined-button` |
| `.mat-icon-button` | `.mat-mdc-icon-button` |
| `.mat-fab` | `.mat-mdc-fab` |
| `.mat-mini-fab` | `.mat-mdc-mini-fab` |
| `.mat-button-wrapper` | Removed (no wrapper element in MDC) |

**Notes**:
- Template selectors are backward-compatible, but internal DOM changed significantly.
- The `.mat-button-wrapper` inner `<span>` was removed. If you targeted it in CSS, update accordingly.
- `mat-flat-button` renders as `.mat-mdc-unelevated-button` in the DOM (MDC naming convention).
- Ripple behavior changed: ripples persist after click instead of animating out.
- Touch targets are larger for accessibility.

---

### Button Toggle

**Template selectors**: No change. `<mat-button-toggle-group>` and `<mat-button-toggle>` remain the same.

**M2 Template (v14)**:
```html
<mat-button-toggle-group name="alignment" [(ngModel)]="selectedVal">
  <mat-button-toggle value="left">Left</mat-button-toggle>
  <mat-button-toggle value="center">Center</mat-button-toggle>
  <mat-button-toggle value="right">Right</mat-button-toggle>
</mat-button-toggle-group>
```

**M3 Template (v18+)**:
```html
<!-- Same selectors. New optional inputs in v19. -->
<mat-button-toggle-group name="alignment" [(ngModel)]="selectedVal"
  [hideSingleSelectionIndicator]="true">
  <mat-button-toggle value="left">Left</mat-button-toggle>
  <mat-button-toggle value="center">Center</mat-button-toggle>
  <mat-button-toggle value="right">Right</mat-button-toggle>
</mat-button-toggle-group>
```

**Notes**:
- Not part of the MDC migration (kept original implementation).
- v19 added `hideSingleSelectionIndicator` and `hideMultipleSelectionIndicator` inputs.
- v19 added checkmark indicator by default for selected toggles (M3 design language).
- `MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY` removed in v19.

---

### Card

**Template selectors**: No change. `<mat-card>`, `<mat-card-header>`, `<mat-card-title>`, `<mat-card-subtitle>`, `<mat-card-content>`, `<mat-card-actions>`, `<mat-card-footer>` all remain.

**M2 Template (v14)**:
```html
<mat-card>
  <mat-card-header>
    <mat-card-title>Title</mat-card-title>
    <mat-card-subtitle>Subtitle</mat-card-subtitle>
  </mat-card-header>
  <img mat-card-image src="photo.jpg">
  <mat-card-content>
    <p>Content here</p>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>Action</button>
  </mat-card-actions>
</mat-card>
```

**M3 Template (v18+)**:
```html
<!-- New optional input: appearance="outlined" or appearance="raised" (default) -->
<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Title</mat-card-title>
    <mat-card-subtitle>Subtitle</mat-card-subtitle>
  </mat-card-header>
  <img mat-card-image src="photo.jpg">
  <mat-card-content>
    <p>Content here</p>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>Action</button>
  </mat-card-actions>
</mat-card>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-card` | `.mat-mdc-card` |
| `.mat-card-header` | `.mat-mdc-card-header` |
| `.mat-card-title` | `.mat-mdc-card-title` |
| `.mat-card-subtitle` | `.mat-mdc-card-subtitle` |
| `.mat-card-content` | `.mat-mdc-card-content` |
| `.mat-card-actions` | `.mat-mdc-card-actions` |
| `.mat-card-footer` | `.mat-mdc-card-footer` |

**Notes**:
- New `appearance` input: `"raised"` (default, matches old behavior) or `"outlined"` (new M3 variant).
- The migration schematic auto-migrates cards to `appearance="outlined"`, which may not match your intent. Review each card.
- Image directives (`mat-card-image`, `mat-card-avatar`) remain the same.

---

### Checkbox

**Template selectors**: No change. `<mat-checkbox>` remains the same.

**M2 Template (v14)**:
```html
<mat-checkbox [(ngModel)]="checked" color="primary">
  Check me
</mat-checkbox>
```

**M3 Template (v18+)**:
```html
<!-- Identical selector. -->
<mat-checkbox [(ngModel)]="checked" color="primary">
  Check me
</mat-checkbox>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-checkbox` | `.mat-mdc-checkbox` |
| `.mat-checkbox-frame` | `.mdc-checkbox__background` |
| `.mat-checkbox-background` | `.mdc-checkbox__background` |
| `.mat-checkbox-checkmark` | `.mdc-checkbox__checkmark` |
| `.mat-checkbox-label` | `.mdc-label` |
| `.mat-checkbox-checked` | `.mat-mdc-checkbox-checked` |
| `.mat-checkbox-layout` | Removed |
| `.mat-checkbox-inner-container` | `.mdc-checkbox` |

**Notes**:
- Checkmark color is now determined by contrast ratio against primary color (white or black).
- After toggling with mouse, ripple remains visible instead of animating out.
- Internal DOM structure changed significantly. If you targeted `.mat-checkbox-layout` or `.mat-checkbox-inner-container`, update your selectors.

---

### Chips

**MAJOR TEMPLATE CHANGE.** Chips were restructured from a single component pattern to three distinct variants for accessibility.

**M2 Template (v14)**:
```html
<!-- Single selection chips -->
<mat-chip-list>
  <mat-chip *ngFor="let chip of chips" [selected]="chip.selected">
    {{ chip.name }}
  </mat-chip>
</mat-chip-list>

<!-- Chips with input (for adding/removing) -->
<mat-chip-list #chipList>
  <mat-chip *ngFor="let fruit of fruits" [removable]="true" (removed)="remove(fruit)">
    {{ fruit }}
    <mat-icon matChipRemove>cancel</mat-icon>
  </mat-chip>
  <input [matChipInputFor]="chipList" (matChipInputTokenEnd)="add($event)">
</mat-chip-list>
```

**M3 Template (v18+)**:
```html
<!-- Selection chips (closest to old pattern) -->
<mat-chip-listbox>
  <mat-chip-option *ngFor="let chip of chips" [selected]="chip.selected">
    {{ chip.name }}
  </mat-chip-option>
</mat-chip-listbox>

<!-- Chips with input (for adding/removing) -->
<mat-chip-grid #chipGrid>
  <mat-chip-row *ngFor="let fruit of fruits" (removed)="remove(fruit)">
    {{ fruit }}
    <button matChipRemove>
      <mat-icon>cancel</mat-icon>
    </button>
  </mat-chip-row>
  <input [matChipInputFor]="chipGrid" (matChipInputTokenEnd)="add($event)">
</mat-chip-grid>

<!-- Static display chips (no interaction) -->
<mat-chip-set>
  <mat-chip *ngFor="let chip of chips">{{ chip.name }}</mat-chip>
</mat-chip-set>
```

**Selector Changes**:
| M2 Selector | M3/MDC Selector | Purpose |
|-------------|----------------|---------|
| `<mat-chip-list>` | `<mat-chip-listbox>` | Selection (auto-migrated) |
| `<mat-chip-list>` | `<mat-chip-grid>` | Input + chips (manual) |
| `<mat-chip-list>` | `<mat-chip-set>` | Static display (manual) |
| `<mat-chip>` (in listbox) | `<mat-chip-option>` | Selectable chip |
| `<mat-chip>` (in grid) | `<mat-chip-row>` | Removable chip with input |
| `<mat-chip>` (in set) | `<mat-chip>` | Static chip |
| `matChipRemove` (on `<mat-icon>`) | `matChipRemove` (on `<button>`) | Remove button must be a `<button>` |

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-chip-list` | `.mat-mdc-chip-listbox` / `.mat-mdc-chip-grid` / `.mat-mdc-chip-set` |
| `.mat-chip` | `.mat-mdc-chip` |
| `.mat-chip-remove` | `.mat-mdc-chip-remove` |

**Notes**:
- **This is the biggest template change in the entire migration.**
- Chips changed from directives to components -- they can no longer be applied to other elements.
- The migration schematic always converts `<mat-chip-list>` to `<mat-chip-listbox>`. You must manually decide whether `<mat-chip-grid>` or `<mat-chip-set>` is more appropriate for each use case.
- `matChipRemove` must now be placed on a `<button>` element, not directly on `<mat-icon>`.
- `[removable]` input was removed. Removability is now implicit based on whether a `matChipRemove` button exists.

---

### Datepicker

**Template selectors**: No change.

**M2 Template (v14)**:
```html
<mat-form-field>
  <mat-label>Choose a date</mat-label>
  <input matInput [matDatepicker]="picker">
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>
```

**M3 Template (v18+)**:
```html
<!-- Update matSuffix to matIconSuffix for the toggle -->
<mat-form-field>
  <mat-label>Choose a date</mat-label>
  <input matInput [matDatepicker]="picker">
  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>
```

**Notes**:
- Datepicker was **not** part of the MDC migration. Its implementation was unchanged.
- The only template change is `matSuffix` -> `matIconSuffix` on the toggle (see Form Field section).
- v19 added color variants support for datepicker.

---

### Dialog

**Template selectors**: No change. `mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`, `mat-dialog-close` remain the same.

**M2 Template (v14)**:
```html
<!-- Dialog component template -->
<h2 mat-dialog-title>Dialog Title</h2>
<mat-dialog-content>
  <p>Dialog content goes here.</p>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>
```

**M3 Template (v18+)**:
```html
<!-- Identical selectors. Padding model changed. -->
<h2 mat-dialog-title>Dialog Title</h2>
<mat-dialog-content>
  <p>Dialog content goes here.</p>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-dialog-container` | `.mat-mdc-dialog-container`, `.mdc-dialog__container` |
| `.mat-dialog-title` | `.mat-mdc-dialog-title` |
| `.mat-dialog-content` | `.mat-mdc-dialog-content` |
| `.mat-dialog-actions` | `.mat-mdc-dialog-actions` |

**Notes**:
- **Critical padding change**: `.mat-dialog-container` no longer has 24px padding. The inner directives (`mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`) now own their own padding.
- If your dialog does NOT use the structural directives (title/content/actions), you will lose all padding. Add your own.
- Default padding values:
  - `mat-dialog-title`: `6px 24px 13px`
  - `mat-dialog-content`: `20px 24px 0`
  - `mat-dialog-actions`: `16px 24px`
- Use `mat.dialog-overrides()` mixin in v19+ to customize padding via design tokens.

---

### Divider

**Template selectors**: No change. `<mat-divider>` remains the same.

**Notes**:
- Not part of the MDC migration. Implementation unchanged.
- No CSS class changes.

---

### Expansion Panel

**Template selectors**: No change. `<mat-expansion-panel>`, `<mat-expansion-panel-header>`, `<mat-panel-title>`, `<mat-panel-description>`, `<mat-accordion>` remain the same.

**M2 Template (v14)**:
```html
<mat-accordion>
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title>Title</mat-panel-title>
      <mat-panel-description>Description</mat-panel-description>
    </mat-expansion-panel-header>
    <p>Panel content</p>
  </mat-expansion-panel>
</mat-accordion>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<mat-accordion>
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title>Title</mat-panel-title>
      <mat-panel-description>Description</mat-panel-description>
    </mat-expansion-panel-header>
    <p>Panel content</p>
  </mat-expansion-panel>
</mat-accordion>
```

**Notes**:
- Not part of the MDC migration.
- `EXPANSION_PANEL_ANIMATION_TIMING` symbol removed in v19.

---

### Form Field

**MAJOR TEMPLATE CHANGE.** Appearance values, prefix/suffix directives, and label requirements all changed.

**M2 Template (v14)**:
```html
<!-- "legacy" and "standard" appearances available -->
<mat-form-field appearance="legacy">
  <input matInput placeholder="This placeholder becomes floating label">
  <span matPrefix>$</span>
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>

<mat-form-field appearance="standard">
  <mat-label>Standard</mat-label>
  <input matInput>
</mat-form-field>

<mat-form-field appearance="fill">
  <mat-label>Fill</mat-label>
  <input matInput>
</mat-form-field>

<mat-form-field appearance="outline">
  <mat-label>Outline</mat-label>
  <input matInput>
</mat-form-field>
```

**M3 Template (v18+)**:
```html
<!-- ONLY "fill" (default) and "outline" appearances remain -->
<!-- "legacy" and "standard" are REMOVED -->
<!-- Placeholders NO LONGER promote to floating labels -->
<!-- mat-label is now REQUIRED for accessibility -->

<mat-form-field appearance="fill">
  <mat-label>Amount</mat-label>
  <input matInput placeholder="0.00">
  <span matTextPrefix>$&nbsp;</span>
  <mat-icon matIconSuffix>search</mat-icon>
</mat-form-field>

<mat-form-field appearance="outline">
  <mat-label>Outline</mat-label>
  <input matInput>
</mat-form-field>
```

**Directive Changes**:
| M2 Directive | M3/MDC Directive | Alignment |
|-------------|-----------------|-----------|
| `matPrefix` | `matTextPrefix` | Baseline-aligned with input text |
| `matPrefix` | `matIconPrefix` | Center-aligned in field |
| `matSuffix` | `matTextSuffix` | Baseline-aligned with input text |
| `matSuffix` | `matIconSuffix` | Center-aligned in field |

> `matPrefix` and `matSuffix` still work but are **deprecated**. When used, they behave like `matIconPrefix`/`matIconSuffix`.

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-form-field` | `.mat-mdc-form-field` |
| `.mat-form-field-wrapper` | `.mat-mdc-text-field-wrapper` |
| `.mat-form-field-flex` | `.mat-mdc-text-field-wrapper` |
| `.mat-form-field-infix` | `.mat-mdc-form-field-infix` |
| `.mat-form-field-label` | `.mat-mdc-floating-label` |
| `.mat-form-field-underline` | `.mdc-line-ripple` |
| `.mat-form-field-prefix` | `.mat-mdc-form-field-text-prefix` / `.mat-mdc-form-field-icon-prefix` |
| `.mat-form-field-suffix` | `.mat-mdc-form-field-text-suffix` / `.mat-mdc-form-field-icon-suffix` |
| `.mat-form-field-subscript-wrapper` | `.mat-mdc-form-field-subscript-wrapper` |

**New Input**:
- `subscriptSizing: 'fixed' | 'dynamic'` -- Controls whether space is reserved for hint/error messages.
  - `'fixed'` (default): Always reserves one line of space below the field.
  - `'dynamic'`: Expands/contracts based on whether hint/error is present.

**Notes**:
- **`appearance="legacy"` removed.** Replace with `"fill"` or `"outline"`.
- **`appearance="standard"` removed.** Replace with `"fill"` (which is now the default when no appearance is specified).
- **Placeholders no longer promote to floating labels.** You must use `<mat-label>` explicitly.
- Dimensions changed: height is larger, horizontal padding increased from 8px to 16px.
- Animation label duration changed from 400ms to 150ms.
- Required marker asterisk now enabled by default. Use `MAT_FORM_FIELD_DEFAULT_OPTIONS` with `hideRequiredMarker: true` to restore old behavior.

---

### Icon

**Template selectors**: No change. `<mat-icon>` remains the same.

**M2 Template (v14)**:
```html
<mat-icon>home</mat-icon>
<mat-icon svgIcon="my-custom-icon"></mat-icon>
<mat-icon fontSet="material-icons-outlined">home</mat-icon>
```

**M3 Template (v18+)**:
```html
<!-- Identical. M3 recommends Material Symbols font instead of Material Icons. -->
<mat-icon>home</mat-icon>
<mat-icon svgIcon="my-custom-icon"></mat-icon>
<mat-icon fontSet="material-symbols-outlined">home</mat-icon>
```

**Notes**:
- Icon was **not** part of the MDC migration.
- M3 design language recommends **Material Symbols** over Material Icons. This is a font swap, not a component change.
- To use Material Symbols, set `fontSet` input or register a font class alias via `MatIconRegistry.registerFontClassAlias()`.
- No selector or CSS class changes.

---

### Input

**Template selectors**: No change. `matInput` directive remains the same.

**M2 Template (v14)**:
```html
<mat-form-field>
  <input matInput placeholder="Name">
</mat-form-field>
```

**M3 Template (v18+)**:
```html
<mat-form-field>
  <mat-label>Name</mat-label>  <!-- Required now -->
  <input matInput placeholder="Name">
</mat-form-field>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-input-element` | `.mat-mdc-input-element` |

**Notes**:
- Must be migrated together with Form Field, Select, and Autocomplete.
- The input element's rendered class changes but the directive selector (`matInput`) is unchanged.

---

### List

**TEMPLATE CHANGE.** New structural directives for list item content.

**M2 Template (v14)**:
```html
<mat-list>
  <mat-list-item>
    <mat-icon mat-list-icon>folder</mat-icon>
    <span mat-line>First line</span>
    <span mat-line>Second line</span>
  </mat-list-item>
</mat-list>

<mat-nav-list>
  <a mat-list-item href="/home">
    <mat-icon mat-list-icon>home</mat-icon>
    <span mat-line>Home</span>
  </a>
</mat-nav-list>

<mat-selection-list [(ngModel)]="selectedOptions">
  <mat-list-option *ngFor="let option of options" [value]="option">
    {{ option }}
  </mat-list-option>
</mat-selection-list>
```

**M3 Template (v18+)**:
```html
<mat-list>
  <mat-list-item>
    <mat-icon matListItemIcon>folder</mat-icon>
    <span matListItemTitle>First line</span>
    <span matListItemLine>Second line</span>
  </mat-list-item>
</mat-list>

<mat-nav-list>
  <a mat-list-item href="/home">
    <mat-icon matListItemIcon>home</mat-icon>
    <span matListItemTitle>Home</span>
  </a>
</mat-nav-list>

<mat-selection-list [(ngModel)]="selectedOptions">
  <mat-list-option *ngFor="let option of options" [value]="option">
    {{ option }}
  </mat-list-option>
</mat-selection-list>
```

**Directive Changes**:
| M2 Directive | M3/MDC Directive | Purpose |
|-------------|-----------------|---------|
| `mat-list-icon` | `matListItemIcon` | Icon in list item |
| `mat-list-avatar` | `matListItemAvatar` | Avatar image in list item |
| `mat-line` | `matListItemTitle` | Primary text (first line) |
| `mat-line` (2nd) | `matListItemLine` | Secondary text (subsequent lines) |
| N/A | `matListItemMeta` | Trailing metadata |

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-list` | `.mat-mdc-list` |
| `.mat-list-item` | `.mat-mdc-list-item` |
| `.mat-list-item-avatar` | `.mat-mdc-list-item-avatar` (was also `.mat-list-item-with-avatar`) |
| `.mat-nav-list` | `.mat-mdc-nav-list` |
| `.mat-selection-list` | `.mat-mdc-selection-list` |
| `.mat-list-option` | `.mat-mdc-list-option` |

**Notes**:
- The migration schematic does **not** auto-convert `mat-list-icon`, `mat-line`, etc. to the new directives. You must do this manually.
- `<mat-action-list>` continues to work the same way.
- List items use the new structural directives to properly slot content into the MDC layout.

---

### Menu

**Template selectors**: No change. `<mat-menu>`, `[matMenuTriggerFor]`, `<mat-menu-item>` remain the same.

**M2 Template (v14)**:
```html
<button mat-button [matMenuTriggerFor]="menu">Menu</button>
<mat-menu #menu="matMenu">
  <button mat-menu-item>Item 1</button>
  <button mat-menu-item>Item 2</button>
</mat-menu>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<button mat-button [matMenuTriggerFor]="menu">Menu</button>
<mat-menu #menu="matMenu">
  <button mat-menu-item>Item 1</button>
  <button mat-menu-item>Item 2</button>
</mat-menu>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-menu-panel` | `.mat-mdc-menu-panel` |
| `.mat-menu-item` | `.mat-mdc-menu-item` |
| `.mat-menu-content` | `.mat-mdc-menu-content` |

**Notes**:
- Template API unchanged. Only internal DOM and CSS classes changed.

---

### Paginator

**Template selectors**: No change. `<mat-paginator>` remains the same.

**M2 Template (v14)**:
```html
<mat-paginator [length]="100" [pageSize]="10" [pageSizeOptions]="[5, 10, 25]">
</mat-paginator>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<mat-paginator [length]="100" [pageSize]="10" [pageSizeOptions]="[5, 10, 25]">
</mat-paginator>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-paginator` | `.mat-mdc-paginator` |

**Notes**:
- Internal tooltip now uses the MDC-based tooltip.
- Template API unchanged.

---

### Progress Bar

**Template selectors**: No change. `<mat-progress-bar>` remains the same.

**M2 Template (v14)**:
```html
<mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
<mat-progress-bar mode="indeterminate"></mat-progress-bar>
<mat-progress-bar mode="buffer" [value]="progress" [bufferValue]="bufferProgress"></mat-progress-bar>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
<mat-progress-bar mode="indeterminate"></mat-progress-bar>
<mat-progress-bar mode="buffer" [value]="progress" [bufferValue]="bufferProgress"></mat-progress-bar>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-progress-bar` | `.mat-mdc-progress-bar` |

**Notes**:
- Template API unchanged. Internal DOM changed for MDC compliance.

---

### Progress Spinner

**Template selectors**: No change. `<mat-progress-spinner>` and `<mat-spinner>` remain the same.

**M2 Template (v14)**:
```html
<mat-progress-spinner mode="determinate" [value]="progress"></mat-progress-spinner>
<mat-spinner></mat-spinner> <!-- Shorthand for indeterminate -->
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<mat-progress-spinner mode="determinate" [value]="progress"></mat-progress-spinner>
<mat-spinner></mat-spinner>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-progress-spinner` | `.mat-mdc-progress-spinner` |
| `.mat-spinner` | `.mat-mdc-progress-spinner` |

**Notes**:
- Template API unchanged.

---

### Radio Button

**Template selectors**: No change. `<mat-radio-group>` and `<mat-radio-button>` remain the same.

**M2 Template (v14)**:
```html
<mat-radio-group [(ngModel)]="selectedValue">
  <mat-radio-button value="option1">Option 1</mat-radio-button>
  <mat-radio-button value="option2">Option 2</mat-radio-button>
</mat-radio-group>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<mat-radio-group [(ngModel)]="selectedValue">
  <mat-radio-button value="option1">Option 1</mat-radio-button>
  <mat-radio-button value="option2">Option 2</mat-radio-button>
</mat-radio-group>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-radio-group` | `.mat-mdc-radio-group` |
| `.mat-radio-button` | `.mat-mdc-radio-button` |
| `.mat-radio-outer-circle` | `.mdc-radio__outer-circle` |
| `.mat-radio-inner-circle` | `.mdc-radio__inner-circle` |
| `.mat-radio-label-content` | `.mdc-label` |
| `.mat-radio-checked` | `.mat-mdc-radio-checked` |
| `.mat-radio-container` | `.mdc-radio` |

**Notes**:
- Template API unchanged but internal DOM is substantially different.
- Radio buttons now use MDC's internal structure with `.mdc-radio__*` classes.

---

### Select

**Template selectors**: No change. `<mat-select>`, `<mat-option>`, `<mat-optgroup>`, `<mat-select-trigger>` remain the same.

**M2 Template (v14)**:
```html
<mat-form-field>
  <mat-label>Favorite food</mat-label>
  <mat-select [(value)]="selectedFood">
    <mat-optgroup label="Fruits">
      <mat-option value="apple">Apple</mat-option>
      <mat-option value="banana">Banana</mat-option>
    </mat-optgroup>
  </mat-select>
</mat-form-field>
```

**M3 Template (v18+)**:
```html
<!-- Identical. Must migrate with form-field, input, and autocomplete as a group. -->
<mat-form-field>
  <mat-label>Favorite food</mat-label>
  <mat-select [(value)]="selectedFood">
    <mat-optgroup label="Fruits">
      <mat-option value="apple">Apple</mat-option>
      <mat-option value="banana">Banana</mat-option>
    </mat-optgroup>
  </mat-select>
</mat-form-field>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-select` | `.mat-mdc-select` |
| `.mat-select-trigger` | `.mat-mdc-select-trigger` |
| `.mat-select-value` | `.mat-mdc-select-value` |
| `.mat-select-panel` | `.mat-mdc-select-panel` |
| `.mat-select-arrow` | `.mat-mdc-select-arrow` |
| `.mat-option` | `.mat-mdc-option` |
| `.mat-optgroup` | `.mat-mdc-optgroup` |

**Notes**:
- Must be migrated together with Form Field, Input, and Autocomplete.
- TypeScript API largely unchanged.

---

### Sidenav

**Template selectors**: No change. `<mat-sidenav-container>`, `<mat-sidenav>`, `<mat-sidenav-content>`, `<mat-drawer-container>`, `<mat-drawer>`, `<mat-drawer-content>` all remain the same.

**Notes**:
- Not part of the MDC migration.
- No template or CSS class changes.

---

### Slide Toggle

**Template selectors**: No change. `<mat-slide-toggle>` remains the same.

**M2 Template (v14)**:
```html
<mat-slide-toggle [(ngModel)]="checked" color="primary">
  Slide me
</mat-slide-toggle>
```

**M3 Template (v18+)**:
```html
<!-- Identical selector. -->
<mat-slide-toggle [(ngModel)]="checked" color="primary">
  Slide me
</mat-slide-toggle>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-slide-toggle` | `.mat-mdc-slide-toggle` |
| `.mat-slide-toggle-bar` | `.mdc-switch__track` |
| `.mat-slide-toggle-thumb` | `.mdc-switch__handle` |
| `.mat-slide-toggle-content` | `.mdc-label` |

**Notes**:
- **Critical accessibility change**: MDC implementation uses `<button role="switch">` instead of `<input type="checkbox">`.
- Slide toggle **no longer responds to native form validation** because it is no longer a checkbox input.
- Touch target is much larger. Allow more space in your layout to prevent overlap with adjacent components.
- Internal DOM is completely different (MDC switch structure).

---

### Slider

**MAJOR TEMPLATE CHANGE.** Slider now requires child `<input>` elements.

**M2 Template (v14)**:
```html
<!-- Simple slider -->
<mat-slider [min]="0" [max]="100" [(ngModel)]="value" thumbLabel></mat-slider>

<!-- Slider with tick interval -->
<mat-slider [min]="0" [max]="100" [tickInterval]="10" thumbLabel></mat-slider>

<!-- Vertical slider -->
<mat-slider vertical [min]="0" [max]="100"></mat-slider>

<!-- Inverted slider -->
<mat-slider invert [min]="0" [max]="100"></mat-slider>
```

**M3 Template (v18+)**:
```html
<!-- Simple slider (now requires child input) -->
<mat-slider [min]="0" [max]="100" discrete>
  <input matSliderThumb [(ngModel)]="value">
</mat-slider>

<!-- Slider with tick marks (replaces tickInterval) -->
<mat-slider [min]="0" [max]="100" [step]="10" showTickMarks discrete>
  <input matSliderThumb>
</mat-slider>

<!-- Range slider (NEW - not possible in M2) -->
<mat-slider [min]="0" [max]="100">
  <input matSliderStartThumb [(ngModel)]="startValue">
  <input matSliderEndThumb [(ngModel)]="endValue">
</mat-slider>

<!-- Vertical sliders: REMOVED -->
<!-- Inverted sliders: REMOVED -->
```

**Selector/Attribute Changes**:
| M2 | M3/MDC | Notes |
|----|--------|-------|
| `<mat-slider>` alone | `<mat-slider>` + child `<input matSliderThumb>` | Input element required |
| `thumbLabel` | `discrete` | Shows value indicator tooltip |
| `[tickInterval]="N"` | `showTickMarks` | Ticks now match step interval |
| `vertical` | Removed | Vertical sliders no longer supported |
| `invert` | Removed | Inverted sliders no longer supported |
| `displayValue` | `displayWith` (function) | Custom thumb label formatting |
| N/A | `matSliderStartThumb` | New: range slider start |
| N/A | `matSliderEndThumb` | New: range slider end |

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-slider` | `.mat-mdc-slider` |
| `.mat-slider-thumb` | `.mdc-slider__thumb` |
| `.mat-slider-track` | `.mdc-slider__track` |

**Notes**:
- **Binding moves from `<mat-slider>` to child `<input>`**: `[(ngModel)]`, `[value]`, `(change)`, etc. are on the `<input>`, not the `<mat-slider>`.
- Range slider is a new capability in MDC that was not available in M2.
- `vertical` and `invert` properties are permanently removed with no replacement.

---

### Snack Bar

**TEMPLATE CHANGE** for custom snack bars only.

**M2 Template (v14)** (custom snack bar component):
```html
<!-- Custom snack bar component template -->
<div>
  <span>{{ message }}</span>
  <button mat-button (click)="dismiss()">Dismiss</button>
</div>
```

**M3 Template (v18+)** (custom snack bar component):
```html
<!-- New structural directives required for custom snack bars -->
<div>
  <span matSnackBarLabel>{{ message }}</span>
  <span matSnackBarActions>
    <button mat-button matSnackBarAction (click)="dismiss()">Dismiss</button>
  </span>
</div>
```

**New Directives**:
| Directive | Purpose | CSS Classes Applied |
|-----------|---------|-------------------|
| `matSnackBarLabel` | Marks the text content | `.mat-mdc-snack-bar-label`, `.mdc-snackbar__label` |
| `matSnackBarActions` | Wraps action buttons container | `.mat-mdc-snack-bar-actions`, `.mdc-snackbar__actions` |
| `matSnackBarAction` | Marks individual action buttons | `.mat-mdc-snack-bar-action`, `.mdc-snackbar__action` |

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-snack-bar-container` | `.mat-mdc-snack-bar-container`, `.mdc-snackbar__surface` |

**Notes**:
- Simple text-based snack bars (opened via `snackBar.open('message', 'action')`) require no template changes.
- Custom snack bars opened via `openFromComponent()` or `openFromTemplate()` should use the new directives.
- If no directives are used, all content is treated as text (no action button styling).

---

### Sort Header

**Template selectors**: No change. `matSort` and `mat-sort-header` remain the same.

**Notes**:
- Not part of the MDC migration.
- No template or CSS class changes.

---

### Stepper

**Template selectors**: No change. `<mat-stepper>`, `<mat-step>`, `matStepLabel`, `matStepperPrevious`, `matStepperNext` remain the same.

**M2 Template (v14)**:
```html
<mat-stepper [linear]="true">
  <mat-step [stepControl]="firstFormGroup">
    <ng-template matStepLabel>Step 1</ng-template>
    <form [formGroup]="firstFormGroup">...</form>
    <button mat-button matStepperNext>Next</button>
  </mat-step>
  <mat-step>
    <ng-template matStepLabel>Step 2</ng-template>
    <button mat-button matStepperPrevious>Back</button>
  </mat-step>
</mat-stepper>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<mat-stepper [linear]="true">
  <mat-step [stepControl]="firstFormGroup">
    <ng-template matStepLabel>Step 1</ng-template>
    <form [formGroup]="firstFormGroup">...</form>
    <button mat-button matStepperNext>Next</button>
  </mat-step>
  <mat-step>
    <ng-template matStepLabel>Step 2</ng-template>
    <button mat-button matStepperPrevious>Back</button>
  </mat-step>
</mat-stepper>
```

**Notes**:
- Not part of the MDC migration.
- `MAT_STEPPER_INTL_PROVIDER` and `MAT_STEPPER_INTL_PROVIDER_FACTORY` removed in v19.

---

### Table

**Template selectors**: No change. `mat-table`, `matColumnDef`, `mat-header-cell`, `mat-cell`, `mat-header-row`, `mat-row`, `mat-footer-row` remain the same.

**M2 Template (v14)**:
```html
<table mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let element">{{ element.name }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

**M3 Template (v18+)**:
```html
<!-- Identical selector structure. -->
<table mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let element">{{ element.name }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-table` | `.mat-mdc-table` |
| `.mat-header-cell` | `.mat-mdc-header-cell` |
| `.mat-cell` | `.mat-mdc-cell` |
| `.mat-header-row` | `.mat-mdc-header-row` |
| `.mat-row` | `.mat-mdc-row` |
| `.mat-footer-cell` | `.mat-mdc-footer-cell` |
| `.mat-footer-row` | `.mat-mdc-footer-row` |

**Notes**:
- All cells now have 16px left and right padding (was variable).
- Row height changed from 48px to 52px.
- Header cells have the same color and text size as data rows (previously more gray and smaller).
- Cell text no longer wraps by default. Apply `white-space: normal` to restore wrapping.

---

### Tabs

**TEMPLATE CHANGE** for `mat-tab-nav-bar`.

**M2 Template (v14)**:
```html
<!-- Tab group (no change) -->
<mat-tab-group>
  <mat-tab label="First">Content 1</mat-tab>
  <mat-tab label="Second">Content 2</mat-tab>
</mat-tab-group>

<!-- Tab nav bar (M2 - no panel reference required) -->
<nav mat-tab-nav-bar>
  <a mat-tab-link *ngFor="let link of links"
     [routerLink]="link.path"
     [active]="rla.isActive"
     routerLinkActive #rla="routerLinkActive">
    {{ link.label }}
  </a>
</nav>
<div>Routed content here</div>
```

**M3 Template (v18+)**:
```html
<!-- Tab group (optional new input) -->
<mat-tab-group [mat-stretch-tabs]="false">
  <mat-tab label="First">Content 1</mat-tab>
  <mat-tab label="Second">Content 2</mat-tab>
</mat-tab-group>

<!-- Tab nav bar (M3 - tabPanel reference REQUIRED) -->
<nav mat-tab-nav-bar [tabPanel]="tabPanel">
  <a mat-tab-link *ngFor="let link of links"
     [routerLink]="link.path"
     [active]="rla.isActive"
     routerLinkActive #rla="routerLinkActive">
    {{ link.label }}
  </a>
</nav>
<mat-tab-nav-panel #tabPanel>
  Routed content here
</mat-tab-nav-panel>
```

**New Elements/Attributes**:
| Change | Details |
|--------|---------|
| `[tabPanel]` input on `mat-tab-nav-bar` | **Required.** References a `<mat-tab-nav-panel>`. |
| `<mat-tab-nav-panel>` | **New element.** Wraps the content connected to the nav bar for accessibility (ARIA labeling). |
| `[mat-stretch-tabs]` | Controls whether tabs stretch to fill container width. Default was changed to stretch. Set to `false` to restore old behavior. |

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-tab-group` | `.mat-mdc-tab-group` |
| `.mat-tab-label` | `.mat-mdc-tab` |
| `.mat-tab-label-active` | `.mdc-tab--active` |
| `.mat-tab-list` | `.mat-mdc-tab-list` |
| `.mat-tab-body` | `.mat-mdc-tab-body` |
| `.mat-tab-header` | `.mat-mdc-tab-header` |
| `.mat-tab-link` | `.mat-mdc-tab-link` |
| `.mat-tab-nav-bar` | `.mat-mdc-tab-nav-bar` |

**Notes**:
- Tab header labels now stretch to fill container width by default.
- Tab layout changed from table to flexbox.
- Active tab header label color now matches theme color.
- `<mat-tab-nav-panel>` is mandatory for accessibility. Without it, assistive technology cannot associate the nav bar with its content.

---

### Timepicker (NEW in v19)

**New component.** Did not exist in M2.

**M3 Template (v19+)**:
```html
<mat-form-field>
  <mat-label>Select time</mat-label>
  <input matInput [matTimepicker]="picker" [(ngModel)]="selectedTime">
  <mat-timepicker-toggle matIconSuffix [for]="picker"></mat-timepicker-toggle>
  <mat-timepicker #picker [interval]="30"></mat-timepicker>
</mat-form-field>
```

**Key Inputs**:
- `[interval]`: Time increment in minutes (default: 30)
- `[min]` / `[max]`: Constraints

**Configuration**:
- Global defaults via `MAT_TIMEPICKER_CONFIG` injection token.

**Notes**:
- Completely new in v19. No M2 equivalent.
- Follows the same pattern as datepicker (toggle + overlay).

---

### Toolbar

**Template selectors**: No change. `<mat-toolbar>` and `<mat-toolbar-row>` remain the same.

**Notes**:
- Not part of the MDC migration.
- No template or CSS class changes.

---

### Tooltip

**Template selectors**: No change. `[matTooltip]` directive remains the same.

**M2 Template (v14)**:
```html
<button mat-button matTooltip="Info about this" matTooltipPosition="above">
  Hover me
</button>
```

**M3 Template (v18+)**:
```html
<!-- Identical. -->
<button mat-button matTooltip="Info about this" matTooltipPosition="above">
  Hover me
</button>
```

**CSS Classes**:
| M2 Class | M3/MDC Class |
|----------|-------------|
| `.mat-tooltip` | `.mat-mdc-tooltip` |

**Notes**:
- Template API unchanged.
- Internal DOM uses MDC tooltip structure.

---

### Tree

**Template selectors**: No change. `<mat-tree>`, `<mat-tree-node>`, `<mat-nested-tree-node>` remain the same.

**Notes**:
- Not part of the MDC migration.
- No template or CSS class changes.

---

## Legacy Module Reference

The following table maps every `MatLegacy*` module (available in v15-v16) to its final MDC replacement (v17+). Legacy modules were removed in v17.

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

---

## Components NOT Part of MDC Migration

These components were never migrated to MDC. They kept their original implementations across all versions. Their selectors, CSS classes, and template APIs did not change:

- Badge (`matBadge`)
- Bottom Sheet (`MatBottomSheet`)
- Button Toggle (`mat-button-toggle-group`)
- Datepicker (`mat-datepicker`)
- Divider (`mat-divider`)
- Expansion Panel (`mat-expansion-panel`)
- Icon (`mat-icon`)
- Ripple (`matRipple`)
- Sidenav / Drawer (`mat-sidenav`, `mat-drawer`)
- Sort Header (`matSort`)
- Stepper (`mat-stepper`)
- Toolbar (`mat-toolbar`)
- Tree (`mat-tree`)

---

## Quick Reference: Top Template Changes to Search For

When migrating a codebase, search for these patterns that require manual template changes:

| Search Pattern | Action Required |
|---------------|----------------|
| `<mat-chip-list` | Replace with `<mat-chip-listbox>`, `<mat-chip-grid>`, or `<mat-chip-set>` |
| `<mat-chip>` inside chip-list | Replace with `<mat-chip-option>`, `<mat-chip-row>`, or keep `<mat-chip>` |
| `matChipRemove` on `<mat-icon>` | Wrap with `<button matChipRemove>` |
| `appearance="legacy"` | Change to `appearance="fill"` or `appearance="outline"` |
| `appearance="standard"` | Change to `appearance="fill"` or remove (fill is default) |
| `matPrefix` | Change to `matTextPrefix` or `matIconPrefix` |
| `matSuffix` | Change to `matTextSuffix` or `matIconSuffix` |
| `mat-line` | Change to `matListItemTitle` (first) / `matListItemLine` (subsequent) |
| `mat-list-icon` | Change to `matListItemIcon` |
| `mat-list-avatar` | Change to `matListItemAvatar` |
| `<mat-slider` without child input | Add `<input matSliderThumb>` child |
| `thumbLabel` | Change to `discrete` |
| `tickInterval` | Change to `showTickMarks` (ticks match step) |
| `vertical` on mat-slider | Remove (no longer supported) |
| `invert` on mat-slider | Remove (no longer supported) |
| `<nav mat-tab-nav-bar>` without tabPanel | Add `[tabPanel]` input and `<mat-tab-nav-panel>` |
| Missing `<mat-label>` in form fields | Add `<mat-label>` (now required) |
| Custom snack bar without structural directives | Add `matSnackBarLabel`, `matSnackBarActions`, `matSnackBarAction` |

---

## CSS Variable Changes (v18 to v19)

| v18 | v19 |
|-----|-----|
| `--sys-*` | `--mat-sys-*` |

Find and replace `--sys` with `--mat-sys` across your stylesheets when upgrading from v18 to v19.

---

## Sources

- [Angular Material MDC Migration Guide (v15)](https://v15.material.angular.dev/guide/mdc-migration)
- [Angular Material MDC Migration Guide (v17)](https://v17.material.angular.dev/guide/mdc-migration)
- [Angular Material M3 Guide (v17)](https://v17.material.angular.dev/guide/material-3)
- [Angular Material v18 Theming Guide](https://v18.material.angular.dev/guide/theming)
- [Angular Material v19 Update Guide](https://angular-material.dev/articles/updating-to-angular-material-19)
- [Halodoc MDC Migration Blog](https://blogs.halodoc.io/mdc-migration-angular/)
- [Dev.to MDC Migration Style Guide](https://dev.to/bharathmuppa/complete-angular-mdc-migaration-guide-b3c)
- [Trung Vo AM15 Migration](https://trungvose.com/blog/angular-material-15-migration/)
- [Duncan Faulkner - What's New in AM15](https://medium.com/ngconf/whats-new-in-angular-material-15-a196e606a33)
- [ng-conf - How to Use the New Mat-Slider](https://medium.com/ngconf/how-to-use-the-new-mat-slider-20fa9fc715e3)
- [Angular Material SASS API Changes Gist](https://gist.github.com/shhdharmen/435f11430bcc4eb6ef9bdb768917d513)
