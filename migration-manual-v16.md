# Angular Material Migration Manual: v15 → v16

> **What this version changes**: Very little. Legacy imports are deprecated but still work. This is a maintenance release — finish any MDC migration work left over from v15.

---

## Step 1: Update Angular and Material

```bash
npx @angular/cli@16 update @angular/core@16 @angular/cli@16 --allow-dirty --force
npx @angular/cli@16 update @angular/material@16 --allow-dirty --force
ng build
```

---

## Step 2: Check for Remaining Legacy Imports

If you completed the MDC migration in v15, there's nothing to do here. Verify:

```bash
# Find any remaining legacy imports
grep -r "legacy-" src/ --include="*.ts"
grep -r "MatLegacy" src/ --include="*.ts"
```

If you find any, **fix them now**. In v17, all `MatLegacy*` imports will be **deleted** from the library and your build will break.

---

## What's Deprecated (Still Works, But Fix Now)

The following still compile in v16 but will be removed in v17:

### Legacy Module Imports

| Deprecated (v16) | Replacement |
|-------------------|-------------|
| `MatLegacyTableModule` from `@angular/material/legacy-table` | `MatTableModule` from `@angular/material/table` |
| `MatLegacyPaginatorModule` from `@angular/material/legacy-paginator` | `MatPaginatorModule` from `@angular/material/paginator` |
| `MatLegacyButtonModule` from `@angular/material/legacy-button` | `MatButtonModule` from `@angular/material/button` |
| `MatLegacyCardModule` from `@angular/material/legacy-card` | `MatCardModule` from `@angular/material/card` |
| `MatLegacyCheckboxModule` from `@angular/material/legacy-checkbox` | `MatCheckboxModule` from `@angular/material/checkbox` |
| `MatLegacyChipsModule` from `@angular/material/legacy-chips` | `MatChipsModule` from `@angular/material/chips` |
| `MatLegacyDialogModule` from `@angular/material/legacy-dialog` | `MatDialogModule` from `@angular/material/dialog` |
| `MatLegacyFormFieldModule` from `@angular/material/legacy-form-field` | `MatFormFieldModule` from `@angular/material/form-field` |
| `MatLegacyInputModule` from `@angular/material/legacy-input` | `MatInputModule` from `@angular/material/input` |
| `MatLegacyListModule` from `@angular/material/legacy-list` | `MatListModule` from `@angular/material/list` |
| `MatLegacyMenuModule` from `@angular/material/legacy-menu` | `MatMenuModule` from `@angular/material/menu` |
| `MatLegacyProgressBarModule` from `@angular/material/legacy-progress-bar` | `MatProgressBarModule` from `@angular/material/progress-bar` |
| `MatLegacyProgressSpinnerModule` from `@angular/material/legacy-progress-spinner` | `MatProgressSpinnerModule` from `@angular/material/progress-spinner` |
| `MatLegacyRadioModule` from `@angular/material/legacy-radio` | `MatRadioModule` from `@angular/material/radio` |
| `MatLegacySelectModule` from `@angular/material/legacy-select` | `MatSelectModule` from `@angular/material/select` |
| `MatLegacySlideToggleModule` from `@angular/material/legacy-slide-toggle` | `MatSlideToggleModule` from `@angular/material/slide-toggle` |
| `MatLegacySliderModule` from `@angular/material/legacy-slider` | `MatSliderModule` from `@angular/material/slider` |
| `MatLegacySnackBarModule` from `@angular/material/legacy-snack-bar` | `MatSnackBarModule` from `@angular/material/snack-bar` |
| `MatLegacyTabsModule` from `@angular/material/legacy-tabs` | `MatTabsModule` from `@angular/material/tabs` |
| `MatLegacyTooltipModule` from `@angular/material/legacy-tooltip` | `MatTooltipModule` from `@angular/material/tooltip` |
| `MatLegacyAutocompleteModule` from `@angular/material/legacy-autocomplete` | `MatAutocompleteModule` from `@angular/material/autocomplete` |

### How to Fix Legacy Imports

If you didn't run the MDC migration schematic in v15, run it now:

```bash
ng generate @angular/material:mdc-migration
```

Then follow the v15 manual for CSS class updates and template changes.

---

## SCSS Theming API — No Changes

The theming API is identical to v15. All the same functions and mixins:

- `mat.core()`
- `mat.define-palette()`
- `mat.define-light-theme()` / `mat.define-dark-theme()`
- `mat.all-component-themes()` / `mat.all-component-colors()`
- `mat.get-color-from-palette()`
- `mat.define-typography-config()` / `mat.define-typography-level()`

No changes needed to your `themes.scss` or any SCSS files.

---

## HTML Templates — No Changes

If you completed the v15 template migration (chips, slider, form field, list, tabs, snack bar), there are no new template changes in v16.

---

## Checklist

- [ ] Run `ng update` for Angular core and Material
- [ ] Search for and eliminate all `MatLegacy*` imports and `legacy-` import paths
- [ ] If legacy imports remain, run `ng generate @angular/material:mdc-migration` and follow the v15 manual
- [ ] Run `ng build` and verify no errors
- [ ] Prepare for v17: legacy imports will be deleted in the next version
