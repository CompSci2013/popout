# Angular Material Migration Manual: v16 → v17

> **What this version changes**: All `MatLegacy*` imports are **permanently deleted**. If any remain in your code, the build will fail. M3 theming is available as experimental — do not use it yet.

---

## Step 1: Ensure Legacy Imports Are Gone

Before upgrading, verify you have no legacy imports:

```bash
grep -r "legacy-" src/ --include="*.ts"
grep -r "MatLegacy" src/ --include="*.ts"
```

If you find any, **stop and complete the MDC migration first** (see the v15 manual). You cannot upgrade to v17 with legacy imports — they will produce build errors because the code they reference no longer exists in the library.

---

## Step 2: Update Angular and Material

```bash
npx @angular/cli@17 update @angular/core@17 @angular/cli@17 --allow-dirty --force
npx @angular/cli@17 update @angular/material@17 --allow-dirty --force
ng build
```

If the build fails with errors about missing modules from `@angular/material/legacy-*`, you have legacy imports that must be converted. Refer to the v15 and v16 manuals.

---

## SCSS Theming API — No Changes

The theming API is identical to v15/v16. You continue to use the same M2 functions:

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

All of these continue to work in v17 without modification:
- `mat.core()`
- `mat.define-palette()`
- `mat.define-light-theme()` / `mat.define-dark-theme()`
- `mat.all-component-themes()` / `mat.all-component-colors()`
- `mat.get-color-from-palette()`
- `mat.define-typography-config()` / `mat.define-typography-level()`

**Do not change your SCSS theming in this version.**

---

## HTML Templates — No Changes

If you completed the v15 template migration, there are no new template changes in v17.

---

## What About M3 Theming? (Experimental — Do Not Use)

v17 introduces Material Design 3 theming as an **experimental** feature. You may see references to it in Angular Material documentation.

**Do not adopt M3 theming in v17.** It is:
- Marked experimental — the API will change
- Not feature-complete
- Not the default

Continue using the M2 theming API (`mat.define-palette()`, `mat.define-light-theme()`, etc.) through v17. M3 theming becomes stable in v18 — that is the version where you will convert your SCSS themes.

---

## Symbols Removed in v17

A few deprecated symbols were cleaned up:

| Removed Symbol | Notes |
|---------------|-------|
| All `MatLegacy*` modules and classes | The entire `@angular/material/legacy-*` import tree |
| `EXPANSION_PANEL_ANIMATION_TIMING` | From expansion panel |

If your code references `EXPANSION_PANEL_ANIMATION_TIMING`, remove the reference or replace with a custom animation timing string.

---

## Checklist

- [ ] Verify zero `MatLegacy*` imports and zero `legacy-` import paths
- [ ] Run `ng update` for Angular core and Material
- [ ] Run `ng build` and verify no errors
- [ ] Do **not** adopt experimental M3 theming — wait for v18
