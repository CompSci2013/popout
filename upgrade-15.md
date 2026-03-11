# Angular 14 → 15 Upgrade Journal

**Project**: popout
**Branch**: feature/themed-15
**Date**: 2026-03-10

---

## Pre-Upgrade Baseline

| Package | Version (Before) |
|---|---|
| @angular/core | ^14.3.0 |
| @angular/cli | ^14.2.13 |
| @angular-devkit/build-angular | ^14.2.13 |
| @angular/material | ^14.2.7 |
| @angular/cdk | ^14.2.7 |
| primeng | ^14.2.3 |
| primeicons | ^6.0.1 |
| typescript | ~4.7.2 |
| rxjs | ~7.5.0 |
| zone.js | ~0.11.4 |
| Node | 20.x |

**Build status**: Passing (confirmed before upgrade). Output: 5.66 MB total.

Pre-existing warnings (not introduced by this upgrade):
- plotly.js-dist-min: CommonJS dependency optimization bailout
- home.component.scss: 8.56 kB exceeds 8 kB budget

---

## Step 1: Verify Clean Build at Angular 14

```bash
ng build
```

**Result**: PASS. Build completed in 7132ms. Output: 5.66 MB total. Only pre-existing warnings.

---

## Step 2: Update Angular Core Packages (14 → 15)

```bash
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 --allow-dirty --force
```

### What Angular 15 Changes

1. **Standalone Components stable** — Standalone APIs (`standalone: true`) are now stable and recommended. No forced migration — existing NgModule-based code continues to work.
2. **Directive composition API** — Directives can be applied to host elements of other directives/components.
3. **Image directive (NgOptimizedImage)** — Stable in v15. Opt-in.
4. **Router standalone APIs** — `provideRouter()` as alternative to `RouterModule.forRoot()`.
5. **MDC-based Material components become default** — This is the **big one**. Legacy Material components move to `@angular/material/legacy-*`. See Step 3.
6. **Functional router guards** — `CanActivate`, `CanDeactivate` etc. can now be plain functions.
7. **`zone.js` 0.11.x → 0.13.x** — Required bump.

### Key Compatibility Requirements

| Dependency | Required Version for Angular 15 |
|---|---|
| TypeScript | ~4.8.2 or ~4.9.3 |
| RxJS | ^6.5.3 \|\| ^7.4.0 |
| zone.js | ~0.11.4 → ~0.13.x (migration handles this) |
| Node | ^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0 |

### Automatic Migrations Executed

1. **`@angular/cli`**:
   - Deleted `.browserslistrc` (Angular 15 uses built-in defaults, custom Browserslist files that match the default are removed)
   - Attempted to remove Karma `require()` calls from `src/test.ts` — **failed** because file doesn't exist (this project doesn't use Karma). Non-blocking.

2. **`@angular/core`**:
   - No code changes needed. No reactive forms, no deprecated APIs found.

**Result**: All critical migrations completed. Karma migration failure is harmless (no Karma in project).

### Versions After This Step

| Package | Version |
|---|---|
| @angular/core | ^15.2.10 |
| @angular/cli | ^15.2.11 |
| @angular-devkit/build-angular | ^15.2.11 |
| typescript | ~4.9.5 |

---

## Step 3: Update Angular Material / CDK (14 → 15)

```bash
npx @angular/cli@15 update @angular/material@15 --allow-dirty --force
```

### What Material 15 Changes

This is the **biggest change** in the Angular 14→15 cycle. Material 15 switches to MDC-based (Material Design Components for Web) implementations as the **default**. The old implementations move to `@angular/material/legacy-*` paths.

1. **MDC becomes default** — `MatTableModule` now points to the new MDC-based table. The old one is at `MatLegacyTableModule` in `@angular/material/legacy-table`.
2. **Automatic migration** — The `ng update` schematic rewrites imports to use `legacy-*` paths so your app keeps working with the old components. You can later opt in to MDC by removing the `legacy-` prefix.
3. **CSS changes** — MDC components have slightly different DOM structure and CSS class names. If you have custom styles targeting Material internals, they may break when switching away from legacy.
4. **`MatSort` unchanged** — Sort module was not part of the MDC migration and stays at `@angular/material/sort`.

### Automatic Migrations Executed

The schematic rewrote 2 files to use legacy imports:

**`src/app/app.module.ts`**:
```diff
-import { MatTableModule } from '@angular/material/table';
+import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
-import { MatPaginatorModule } from '@angular/material/paginator';
+import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
```

**`src/app/features/mat-data-table/mat-data-table.component.ts`**:
```diff
-import { MatTableDataSource } from '@angular/material/table';
+import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
-import { MatPaginator } from '@angular/material/paginator';
+import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
```

The migration uses `as` aliases so all downstream code (`MatTableModule`, `MatPaginator`, etc.) continues to work without renaming anything else.

**Result**: Clean migration. Two files modified automatically.

### Versions After This Step

| Package | Version |
|---|---|
| @angular/material | ^15.2.9 |
| @angular/cdk | ^15.2.9 |

---

## Step 4: Update PrimeNG

PrimeNG 15 is the matching major version for Angular 15. primeicons stays at v6 (compatible).

```bash
npm install primeng@15 primeicons@6
```

### PrimeNG 14 → 15 Changes

1. **API largely stable** — p-table, p-dropdown, MessageService API unchanged.
2. **Theme CSS** — Same theme structure, no breaking changes.
3. **Minimum Angular** — PrimeNG 15 requires Angular 15+.
4. **primeicons** — Stays at v6. No icon changes.

**Result**: Clean install. No API changes needed.

### Versions After This Step

| Package | Version |
|---|---|
| primeng | ^15.4.1 |
| primeicons | ^6.0.1 |

---

## Step 5: Update TypeScript

TypeScript was automatically bumped to ~4.9.5 by the Angular core migration in Step 2. No separate install needed.

| Package | Version |
|---|---|
| typescript | ~4.9.5 |

---

## Step 6: Update zone.js

Angular 15 requires zone.js ~0.13.x (up from ~0.11.4).

```bash
npm install zone.js@~0.13.0
```

**Result**: Clean install. zone.js updated to ^0.13.3.

---

## Step 7: Update tsconfig.json

Angular 15's CLI overrides `target` to ES2022 at build time and warns if tsconfig doesn't match. Updated manually to eliminate the warning:

```diff
-    "target": "es2020",
-    "module": "es2020",
+    "target": "ES2022",
+    "module": "ES2022",
+    "useDefineForClassFields": false,
     "lib": [
-      "es2020",
+      "ES2022",
       "dom"
     ],
```

> **Note**: `useDefineForClassFields: false` is required because Angular's decorator-based class fields rely on the legacy TypeScript emit behavior. Without this flag, `@ViewChild`, `@Input`, etc. would break.

---

## Step 8: Build Verification

```bash
ng build
```

**Result**: PASS. Build completed in 37467ms. Output: 5.76 MB total.

Warnings (pre-existing, not introduced by upgrade):
- plotly.js-dist-min: CommonJS dependency optimization bailout
- home.component.scss: 8.56 kB exceeds 8 kB budget

The tsconfig target warning from the first build is now gone after Step 7.

---

## Step 9: Dev Server Smoke Test

```bash
ng serve --host 0.0.0.0 --port 4208 --disable-host-check
```

**Result**: (pending — will verify after commit)

---

## Post-Upgrade Final Versions

| Package | Before | After |
|---|---|---|
| @angular/core | ^14.3.0 | ^15.2.10 |
| @angular/cli | ^14.2.13 | ^15.2.11 |
| @angular-devkit/build-angular | ^14.2.13 | ^15.2.11 |
| @angular/material | ^14.2.7 | ^15.2.9 |
| @angular/cdk | ^14.2.7 | ^15.2.9 |
| primeng | ^14.2.3 | ^15.4.1 |
| primeicons | ^6.0.1 | ^6.0.1 (unchanged) |
| typescript | ~4.7.2 | ~4.9.5 |
| rxjs | ~7.5.0 | ~7.5.0 (unchanged) |
| zone.js | ~0.11.4 | ^0.13.3 |

---

## Automatic Config Changes Summary

### `.browserslistrc`
Deleted by migration (Angular 15 uses built-in browser defaults).

### `tsconfig.json`
```diff
-    "target": "es2020",
-    "module": "es2020",
+    "target": "ES2022",
+    "module": "ES2022",
+    "useDefineForClassFields": false,
     "lib": [
-      "es2020",
+      "ES2022",
       "dom"
     ],
```

---

## Breaking Changes Encountered

### Material 15 MDC Migration (automatic, non-breaking in practice)

Material 15 moved to MDC-based components as the default. The migration schematic automatically rewrote imports to use `legacy-*` paths (`@angular/material/legacy-table`, `@angular/material/legacy-paginator`). This keeps the app working with the pre-MDC components.

**Affected components in this project**:
- `MatTableModule` → `MatLegacyTableModule` (aliased as `MatTableModule`)
- `MatTableDataSource` → `MatLegacyTableDataSource` (aliased as `MatTableDataSource`)
- `MatPaginatorModule` → `MatLegacyPaginatorModule` (aliased as `MatPaginatorModule`)
- `MatPaginator` → `MatLegacyPaginator` (aliased as `MatPaginator`)

**Not affected**: `MatSort` / `MatSortModule` (sort was not part of MDC migration).

### Things to Watch in Future Upgrades

1. **Legacy Material removal** — `@angular/material/legacy-*` components are deprecated and will be removed in a future version. Plan to migrate to MDC components (remove `legacy-` prefix, update CSS).
2. **Standalone migration** — Angular 15 makes standalone components stable. The schematic `ng generate @angular/core:standalone` can auto-migrate NgModules to standalone. Optional but recommended before Angular 17+.
3. **zone.js removal** — Angular 15+ begins experimental support for zoneless change detection. Not relevant yet but watch for Angular 18+.

---

## Command Summary (Copy-Paste Reference)

```bash
# 1. Verify clean build
ng build

# 2. Update Angular core + CLI
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 --allow-dirty --force

# 3. Update Material + CDK
npx @angular/cli@15 update @angular/material@15 --allow-dirty --force

# 4. Update PrimeNG (primeicons stays at v6)
npm install primeng@15 primeicons@6

# 5. Update zone.js
npm install zone.js@~0.13.0

# 6. Update tsconfig.json target to ES2022 (see Step 7 for diff)

# 7. Verify build
ng build

# 8. Smoke test
ng serve --host 0.0.0.0 --port 4208
```

Total time: ~5 minutes (excluding npm install wait times).
