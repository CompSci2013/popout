# Angular 13 → 14 Upgrade Journal

**Project**: popout
**Branch**: feature/themed-v14
**Date**: 2026-03-10

---

## Pre-Upgrade Baseline

| Package | Version (Before) |
|---|---|
| @angular/core | ~13.3.0 |
| @angular/cli | ~13.3.11 |
| @angular-devkit/build-angular | ~13.3.11 |
| @angular/material | ^13.3.9 |
| @angular/cdk | ^13.3.9 |
| primeng | ^13.4.1 |
| primeicons | ^5.0.0 |
| typescript | ~4.6.2 |
| rxjs | ~7.5.0 |
| zone.js | ~0.11.4 |
| Node | 20.19.6 |

**Build status**: Passing (confirmed before upgrade)

---

## Step 1: Verify Clean Build at Angular 13

Before touching anything, confirm the project builds cleanly.

```bash
ng build
```

**Result**: PASS. Build completed in 7012ms. Output: 5.64 MB total. Only pre-existing warnings (plotly CommonJS, home component SCSS budget).

---

## Step 2: Update Angular Core Packages (13 → 14)

Angular's official upgrade path is one major version at a time. Use `ng update` for automatic migrations.

```bash
npx @angular/cli@14 update @angular/core@14 @angular/cli@14 --allow-dirty --force
```

> **Note**: `--allow-dirty` is needed if you have uncommitted changes. `--force` bypasses peer dependency version checks. Use the target version's CLI (`npx @angular/cli@14`) to ensure the correct migration schematics run.

### What Angular 14 Changes

1. **Typed Forms** — `FormControl`, `FormGroup`, `FormArray` are now strictly typed. Old code using these needs `UntypedFormControl`, `UntypedFormGroup`, etc. If your project only uses `FormsModule` (template-driven), **no impact**.
2. **Standalone Components** — New opt-in feature (no migration required).
3. **`ng completion`** — CLI auto-completion (informational only).
4. **Strict injection** — `@Inject` decorator enforcement tightened.
5. **Title strategy** — `TitleStrategy` for route-based page titles.

### Key Compatibility Requirements

| Dependency | Required Version for Angular 14 |
|---|---|
| TypeScript | ~4.6.2 or ~4.7.2 |
| RxJS | ^6.5.3 \|\| ^7.4.0 |
| zone.js | ~0.11.4 (stays the same) |
| Node | ^14.15.0 \|\| ^16.10.0 \|\| ^18.x (v20 works in practice) |

### Automatic Migrations Executed

The `ng update` schematic ran these migrations automatically:

1. **`@angular/cli`**:
   - Removed `defaultProject` from `angular.json` (deprecated; CLI now infers from cwd)
   - Removed `showCircularDependencies` option (no longer supported)
   - Replaced `defaultCollection` with `schematicCollections` in workspace config
   - Updated dependency version prefixes from `~` to `^`
   - Updated TypeScript compilation target to `ES2020` in `tsconfig.json`

2. **`@angular/core`**:
   - Scanned for `entryComponents` (deprecated since v13, removed in v14)
   - Updated `pathMatch` in Routes to strict `'full' | 'prefix'` union type
   - Scanned for Forms classes and applied `Untyped*` prefix if needed (none found in this project)

**Result**: All migrations completed successfully. No manual intervention needed.

### Versions After This Step

| Package | Version |
|---|---|
| @angular/core | ^14.3.0 |
| @angular/cli | ^14.2.13 |
| @angular-devkit/build-angular | ^14.2.13 |

---

## Step 3: Update Angular Material / CDK (13 → 14)

```bash
npx @angular/cli@14 update @angular/material@14 --allow-dirty --force
```

### What Material 14 Changes

1. **MDC-based components (opt-in)** — Material 14 begins migrating to MDC (Material Design Components for Web). In v14, legacy components remain the default. No forced migration yet (that comes in v15).
2. **Component import paths stay the same** — `@angular/material/table`, `@angular/material/sort`, `@angular/material/paginator` — unchanged.
3. **Theming** — No breaking changes in v14. Custom CSS variables approach (as used in this project) is unaffected.

### Automatic Migrations Executed

- CDK updated to v14 (no code changes needed)
- Material updated to v14 (no code changes needed)

**Result**: Clean update. No code modifications required.

### Versions After This Step

| Package | Version |
|---|---|
| @angular/material | ^14.2.7 |
| @angular/cdk | ^14.2.7 |

---

## Step 4: Update PrimeNG

PrimeNG 13.x supports Angular 13. For Angular 14, PrimeNG 14.x is the matching major version.

### Gotcha: primeicons Peer Dependency

PrimeNG 14 requires `primeicons@^6.0.1`. If you try:

```bash
npm install primeng@14
# FAILS: ERESOLVE — peer primeicons@"^6.0.1" from primeng@14.2.3
```

**Fix**: Install both together:

```bash
npm install primeng@14 primeicons@6
```

### PrimeNG 13 → 14 Changes

1. **API is largely stable** — p-table, p-dropdown, MessageService API unchanged.
2. **Theme CSS** — Same theme structure, no breaking changes.
3. **Minimum Angular** — PrimeNG 14 requires Angular 14+.
4. **primeicons** — Bumped from v5 to v6. Some icon names may have changed; check if your templates reference specific icon classes.

**Result**: Clean install. No API changes needed.

### Versions After This Step

| Package | Version |
|---|---|
| primeng | ^14.2.3 |
| primeicons | ^6.0.1 |

---

## Step 5: Update TypeScript

TypeScript 4.6 is compatible with Angular 14, but upgrading to 4.7 is recommended to prepare for Angular 15 (which requires 4.8+).

```bash
npm install typescript@~4.7.2 --save-dev
```

**Result**: Clean install. No compilation issues.

### Version After This Step

| Package | Version |
|---|---|
| typescript | ~4.7.2 |

---

## Step 6: Automatic Config Changes Summary

These files were modified by the migration schematics (not manually):

### `tsconfig.json`
```diff
-    "target": "es2017",
+    "target": "es2020",
```

### `angular.json`
```diff
-  },
-  "defaultProject": "popout"
+  }
```

No other config files were changed.

---

## Step 7: Build Verification

```bash
ng build
```

**Result**: PASS. Build completed in 43008ms (longer due to first build with new toolchain). Output: 5.66 MB total.

Warnings (pre-existing, not introduced by upgrade):
- plotly.js-dist-min: CommonJS dependency optimization bailout
- home.component.scss: 8.56 kB exceeds 8 kB budget

---

## Step 8: Dev Server Smoke Test

```bash
ng serve --host 0.0.0.0 --port 4208 --disable-host-check
```

**Result**: PASS. Server started, compiled successfully, HTTP 200 on `/`.

---

## Post-Upgrade Final Versions

| Package | Before | After |
|---|---|---|
| @angular/core | ~13.3.0 | ^14.3.0 |
| @angular/cli | ~13.3.11 | ^14.2.13 |
| @angular-devkit/build-angular | ~13.3.11 | ^14.2.13 |
| @angular/material | ^13.3.9 | ^14.2.7 |
| @angular/cdk | ^13.3.9 | ^14.2.7 |
| primeng | ^13.4.1 | ^14.2.3 |
| primeicons | ^5.0.0 | ^6.0.1 |
| typescript | ~4.6.2 | ~4.7.2 |
| rxjs | ~7.5.0 | ~7.5.0 (unchanged) |
| zone.js | ~0.11.4 | ~0.11.4 (unchanged) |

---

## Breaking Changes Encountered

**None.** This was a clean upgrade with zero manual code changes required.

### Why It Was Clean

1. No reactive forms (`FormControl`, `FormGroup`) — so typed forms migration had nothing to do
2. No `entryComponents` — already removed in Angular 13
3. Material import paths already used non-legacy format (`@angular/material/table` not `@angular/material/legacy-table`)
4. PrimeNG API stable between v13 and v14
5. Template-driven forms (`ngModel`) are unaffected by the typed forms change

### Things to Watch in Other Projects

1. **Reactive Forms**: Any `FormControl`, `FormGroup`, `FormArray` usage will be auto-migrated to `UntypedFormControl`, etc. You can later manually add types for stricter checking.
2. **entryComponents**: If still present, the migration removes them (they were deprecated in v13, no-op in v14).
3. **pathMatch in Routes**: If you have routes with `pathMatch: 'full'`, the type becomes a strict union. The migration adds explicit `Route` typing to variables.
4. **PrimeNG icon names**: If you use specific primeicons classes, verify they still exist in primeicons v6.
5. **Material MDC**: In v14, MDC is opt-in. In v15, it becomes the default and legacy imports move to `@angular/material/legacy-*`. Plan ahead.

---

## Command Summary (Copy-Paste Reference)

```bash
# 1. Verify clean build
ng build

# 2. Update Angular core + CLI
npx @angular/cli@14 update @angular/core@14 @angular/cli@14 --allow-dirty --force

# 3. Update Material + CDK
npx @angular/cli@14 update @angular/material@14 --allow-dirty --force

# 4. Update PrimeNG + primeicons (must be together)
npm install primeng@14 primeicons@6

# 5. Update TypeScript (optional but recommended)
npm install typescript@~4.7.2 --save-dev

# 6. Verify build
ng build

# 7. Smoke test
ng serve --host 0.0.0.0 --port 4208
```

Total time: ~5 minutes (excluding npm install wait times).
