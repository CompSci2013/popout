# Angular Material: v14 → v15 Quick Reference

## Terminology — Get This Right First

| Term | What it means |
|---|---|
| **Angular Material** | The Angular component library (`@angular/material`). NOT "Material UI" — that's the React library. |
| **MDC-Web** | Material Design Components for Web — Google's reference vanilla JS/CSS library. |
| **Legacy components** | Angular Material's old custom implementations (what you've been using in v13/v14). |
| **MDC-based components** | New implementations in v15 built on top of MDC-Web. Same API, different internals. |
| **M2 / M3** | Material Design 2 and Material Design 3 — Google's design specifications. **NOT relevant to the v14→v15 upgrade.** M3 support arrived in Angular Material v17+ (experimental) and v18 (stable). |

### The v14→v15 change in one sentence

> Angular Material v15 swaps the internal implementation of components from custom code to MDC-Web. The design spec stays M2. The API stays mostly the same. The CSS classes and DOM structure change.

---

## What Happens When You Run `ng update @angular/material@15`

The upgrade schematic does two things in sequence:

### Phase 1: Automatic Legacy Aliasing (runs immediately)

The schematic rewrites your imports to use `legacy-` paths, aliased back to the old names:

```typescript
// BEFORE (v14)
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

// AFTER Phase 1 (v15, legacy aliases)
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
```

**This is where `popout` is right now.** The app builds and runs, but it's using deprecated legacy components.

### Phase 2: MDC Migration (run manually when ready)

```bash
ng generate @angular/material:mdc-migration
```

This converts legacy imports to the new MDC-based components. It:
1. Removes the `Legacy` prefix and `legacy-` import paths
2. Updates templates where needed
3. Adds `/* TODO(mdc-migration): */` comments for things it can't auto-fix (mostly CSS)

---

## The Three Layers of Breakage

### 1. TypeScript Imports (auto-fixed)

The schematic handles this. Legacy → MDC import paths are rewritten automatically.

```typescript
// Legacy (Phase 1 — what you have now)
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

// MDC (Phase 2 — after migration)
import { MatTableModule } from '@angular/material/table';
```

The class names and module names stay the same (`MatTableModule`, `MatTableDataSource`, `MatPaginator`). Only the import path changes.

### 2. Templates (mostly auto-fixed)

Most template selectors (`mat-table`, `mat-sort-header`, `mat-paginator`, `matColumnDef`, etc.) are unchanged. The MDC migration schematic handles the few that do change.

Known template changes:
- `mat-form-field`: `appearance="standard"` and `appearance="legacy"` are removed. Use `"fill"` or `"outline"`.
- `mat-form-field`: `floatLabel="never"` is deprecated. Use `"always"` or `"auto"`.
- `matPrefix` / `matSuffix` split into `matTextPrefix` / `matTextSuffix` (text) and `matIconPrefix` / `matIconSuffix` (icons).

### 3. CSS Selectors (NOT auto-fixed — this is the pain)

This is where most manual work lives. MDC-based components use different CSS class names:

| Legacy CSS class | MDC CSS class | Notes |
|---|---|---|
| `.mat-header-row` | `.mat-mdc-header-row` | |
| `.mat-header-cell` | `.mat-mdc-header-cell` | |
| `.mat-row` | `.mat-mdc-row` | |
| `.mat-cell` | `.mat-mdc-cell` | |
| `.mat-sort-header-arrow` | `.mat-sort-header-arrow` | Sort is NOT an MDC component — no change |
| `.mat-paginator` | `.mat-mdc-paginator` | |
| `.mat-paginator-range-label` | `.mat-mdc-paginator-range-label` | |
| `.mat-paginator-page-size-label` | `.mat-mdc-paginator-page-size-label` | |
| `.mat-icon-button` | `.mat-mdc-icon-button` | |
| `.mat-select-value` | `.mat-mdc-select-value` | |
| `.mat-form-field-flex` | `.mat-mdc-text-field-wrapper` | Name changed entirely |
| `.mat-input-element` | `.mat-mdc-input-element` | |
| `.mat-button` | `.mat-mdc-button` | |
| `.mat-raised-button` | `.mat-mdc-raised-button` | |
| `.mat-tab-label` | `.mat-mdc-tab` | Name changed entirely |

**The pattern**: most classes just get `-mdc-` inserted after `mat`, but some are renamed entirely. The migration schematic adds `/* TODO(mdc-migration): */` comments where it detects these in your SCSS/CSS.

### What NOT to do

Don't blindly find-and-replace `.mat-` → `.mat-mdc-`. Some components (like `MatSort`) are not MDC-based and keep their original class names. Follow the TODO comments the schematic generates.

---

## DOM Structure Changes

MDC-based components have different internal DOM. If you're using `::ng-deep` to reach into component internals (like `popout` does for table styling), those selectors may break silently — styles just stop applying.

Example: the table's internal wrapper elements change. A `::ng-deep .mat-header-row` that worked in legacy won't match anything in MDC because the class is now `.mat-mdc-header-row`.

---

## Visual Differences

MDC-based components render with slightly different:
- **Spacing** — padding/margins differ
- **Typography** — font sizes and weights may shift
- **Ripple effects** — MDC uses its own ripple implementation
- **Density** — default density may feel more spacious

These aren't bugs — they're the MDC-Web defaults. You'll need to adjust your custom CSS to compensate.

---

## The `mat.typography-hierarchy` Change

In v14, importing Angular Material's theme automatically applied typography styles via the `.mat-typography` class.

In v15 (MDC), typography styles are **no longer auto-applied**. You must explicitly include them:

```scss
@use '@angular/material' as mat;

// You now need this if you relied on automatic typography
@include mat.typography-hierarchy($your-theme);
```

If your text suddenly looks different after migration (wrong font, wrong sizes), this is why.

---

## Migration Strategy: Two Approaches

### Approach A: Big Bang (small apps)
1. Run `ng update @angular/material@15`
2. Immediately run `ng generate @angular/material:mdc-migration`
3. Fix all `TODO(mdc-migration)` comments
4. Test everything

### Approach B: Gradual (large apps)
1. Run `ng update @angular/material@15` (everything moves to legacy imports)
2. App builds and works — ship this
3. Migrate one component/module at a time from legacy → MDC
4. Remove legacy imports as you go

**Legacy components are deprecated** and were removed entirely in Angular Material v17. Don't stay on them long.

---

## Quick Reference: What `popout` Needs

Based on the current codebase, `popout` uses these Material components:

| Component | Current Import | Needs MDC Migration |
|---|---|---|
| MatTable | `@angular/material/legacy-table` | Yes |
| MatTableDataSource | `@angular/material/legacy-table` | Yes |
| MatPaginator | `@angular/material/legacy-paginator` | Yes |
| MatSort | `@angular/material/sort` | No (not an MDC component) |

CSS selectors that will need updating in `mat-data-table.component.scss`:
- `.mat-header-row` → `.mat-mdc-header-row`
- `.mat-header-cell` → `.mat-mdc-header-cell`
- `.mat-sort-header-arrow` → no change (sort is not MDC)
- `.mat-row` → `.mat-mdc-row`
- `.mat-cell` → `.mat-mdc-cell`
- `.mat-paginator` → `.mat-mdc-paginator`
- `.mat-paginator-range-label` → `.mat-mdc-paginator-range-label`
- `.mat-icon-button` → `.mat-mdc-icon-button`
- `.mat-select-value` → `.mat-mdc-select-value`
- `.mat-paginator-page-size-label` → `.mat-mdc-paginator-page-size-label`

---

## Commands Cheat Sheet

```bash
# 1. Upgrade Angular core to 15 first
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 --allow-dirty --force

# 2. Upgrade Material + CDK (auto-applies legacy aliases)
npx @angular/cli@15 update @angular/material@15 --allow-dirty --force

# 3. Verify build with legacy imports
ng build

# 4. Run MDC migration (when ready)
ng generate @angular/material:mdc-migration

# 5. Find all TODO comments left by the migration
grep -r "TODO(mdc-migration)" src/

# 6. Verify build after MDC migration
ng build
```

---

## Sources

- [Angular Material MDC Migration Guide (v15)](https://v15.material.angular.dev/guide/mdc-migration)
- [Angular Material 15 Migration — Trung Vo](https://trungk18.com/experience/angular-material-15-migration/)
- [MDC Migration Challenges — HaloDoc Engineering](https://blogs.halodoc.io/mdc-migration-angular/)
- [Solving Style Issues: MDC Migration Guide](https://dev.to/bharathmuppa/complete-angular-mdc-migaration-guide-b3c)
- [UPGRADE to Angular Material v15 with MDC](https://dev.to/mohd_irshad_9f988211f893a/upgrade-to-angular-material-v15-with-mdc-2a22)
