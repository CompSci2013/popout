# How Theme Switching Works in This Application

## Overview

Theme switching operates through three cooperating layers:

1. **Angular service** (`ThemeService`) — manages state, toggles a CSS class on `<body>`
2. **Material SCSS theming** (`themes.scss`) — uses `@use '@angular/material' as mat` to define palettes and emit component styles per theme
3. **CSS custom properties** — bridge Material's SCSS output to non-Material elements (custom markup, status badges, layout chrome)

---

## Primary Example: The Material Data Table

The `mat-data-table` component (`src/app/features/mat-data-table/`) is the best example of all three layers working together. It uses:

- **`mat-table`** — Material's data table directive
- **`matSort` / `mat-sort-header`** — column sorting
- **`mat-paginator`** — row pagination
- **`MatTableDataSource`** — client-side filtering
- Custom elements: status badges, clearance bars, filter input

### How the table is built (template)

```html
<!-- mat-data-table.component.html -->
<table mat-table [dataSource]="dataSource" matSort class="themed-mat-table">

  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
    <td mat-cell *matCellDef="let row"> {{ row.name }} </td>
  </ng-container>

  <!-- ... more columns ... -->

  <ng-container matColumnDef="status">
    <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
    <td mat-cell *matCellDef="let row">
      <span class="status-badge" [ngClass]="getStatusClass(row.status)">
        {{ row.status }}
      </span>
    </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>

<mat-paginator [pageSizeOptions]="[5, 10, 20]" [pageSize]="10"
               showFirstLastButtons>
</mat-paginator>
```

### How Material theming styles it (themes.scss)

When the user selects "Sapphire," the body gets class `sapphire-theme`. In `themes.scss`, that class wraps a Material color override:

```scss
@use '@angular/material' as mat;

// Build-time: define the sapphire palette and theme
$sapphire-primary: mat.define-palette(mat.$indigo-palette, 800, 300, 900);
$sapphire-accent:  mat.define-palette(mat.$blue-palette, A200, A100, A400);
$sapphire-warn:    mat.define-palette(mat.$red-palette);

$sapphire-theme: mat.define-dark-theme((
  color: (
    primary: $sapphire-primary,
    accent: $sapphire-accent,
    warn: $sapphire-warn,
  ),
  typography: $popout-typography,
  density: 0,
));

// Emit color-only overrides scoped to the body class
body.sapphire-theme {
  @include mat.all-component-colors($sapphire-theme);
}
```

At build time, the SCSS compiler expands `mat.all-component-colors()` into hundreds of CSS rules scoped under `body.sapphire-theme`. Here's what the compiled output looks like for the table specifically:

```css
/* Compiled output (simplified — what the browser actually sees) */

/* Table background */
body.sapphire-theme .mat-table    { background: #1a1a30; }

/* Header row */
body.sapphire-theme .mat-header-cell { color: rgba(208, 216, 240, 0.54); }

/* Sort arrow inherits from primary palette */
body.sapphire-theme .mat-sort-header-arrow { color: #90a0c8; }

/* Row hover uses primary with low opacity */
body.sapphire-theme .mat-row:hover { background: rgba(85, 119, 238, 0.04); }

/* Paginator navigation buttons use primary palette */
body.sapphire-theme .mat-paginator-icon { color: rgba(208, 216, 240, 0.54); }
body.sapphire-theme .mat-paginator { background: #1a1a30; color: rgba(208, 216, 240, 0.54); }
```

**No JavaScript runs to produce these styles.** The SCSS compiler baked them in at build time. The browser activates them via CSS specificity when the body class changes.

### How the component SCSS adds custom overrides

The Material theming API handles standard component internals (cell text color, header background, paginator button states). But this table also has custom styling needs that Material doesn't cover:

```scss
// mat-data-table.component.scss

// These target Material's DOM classes but override them with theme variables
// to achieve effects beyond what the Material palette provides (striped rows,
// custom hover colors, uppercase headers, etc.)

:host ::ng-deep .themed-mat-table {
  .mat-header-row {
    background: var(--theme-table-header-bg) !important;  // from palette via bridge
  }

  .mat-header-cell {
    color: var(--theme-table-header-text) !important;
    font-weight: 600;
    text-transform: uppercase;          // Material doesn't do this
    letter-spacing: 0.5px;              // Material doesn't do this

    .mat-sort-header-arrow {
      color: var(--theme-text-muted) !important;
    }
  }

  .mat-row {
    background: var(--theme-table-row-bg) !important;

    &:nth-child(even) {
      background: var(--theme-table-row-alt-bg) !important;  // striped rows
    }

    &:hover {
      background: var(--theme-table-row-hover-bg) !important;
    }
  }

  .mat-cell {
    color: var(--theme-table-cell-text) !important;
    border-bottom-color: var(--theme-table-border) !important;
  }
}
```

The `!important` overrides are necessary because Material's compiled styles have high specificity. The `::ng-deep` combinator pierces Angular's view encapsulation to reach Material's internal DOM nodes.

### The bridge: palette colors as CSS custom properties

The custom properties like `--theme-table-header-bg` are set inside the same body class block, using `mat.get-color-from-palette()` to extract colors from the Material palette at build time:

```scss
// themes.scss — inside body.sapphire-theme { }

// Extract a specific hue from the palette and expose it as a CSS variable
--theme-table-header-bg: #{mat.get-color-from-palette($sapphire-primary, 800)};
--theme-table-header-text: #d0d8f0;
--theme-table-row-bg: #1a1a36;
--theme-table-row-alt-bg: #14142c;
--theme-table-row-hover-bg: #262650;
--theme-table-border: rgba(80, 100, 200, 0.3);
--theme-table-cell-text: #c0c8e0;
```

This bridge means:
- **Material's own styles** use the palette directly (via `mat.all-component-colors`)
- **Custom overrides** use CSS variables that are _derived from_ the same palette
- Both switch simultaneously when the body class changes

### What each Material element looks like across themes

| Element | Dark | Light | Crimson | Sapphire |
|---|---|---|---|---|
| Header row bg | `blue-gray 700` | `indigo 100` | `red 800` | `indigo 800` |
| Sort arrow | `#888` muted | `#888` muted | `#906060` muted | `#607090` muted |
| Row bg | `#2a2a2a` | `#ffffff` | `#301818` | `#1a1a36` |
| Striped row | `#242424` | `#f8f9fa` | `#281010` | `#14142c` |
| Hover row | `#333340` | `#e8f0fe` | `#442222` | `#262650` |
| Cell text | `#e0e0e0` | `#333333` | `#e0c0c0` | `#c0c8e0` |
| Paginator bg | matches header | matches header | matches header | matches header |

### Custom elements inside the table (not Material)

The **status badges** and **clearance bars** inside table cells are plain HTML — not Material components. They use CSS custom properties directly:

```scss
// Status badges — inside <td mat-cell>
.status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-on-duty {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

// Clearance bar — visual meter inside <td mat-cell>
.clearance-fill {
  height: 6px;
  border-radius: 3px;
  background: var(--theme-accent-gradient);  // uses theme variable
}
.clearance-label {
  color: var(--theme-text-secondary);         // uses theme variable
}
```

---

## The Theme Switching Mechanism

### Step 1: User selects a theme from the dropdown

```typescript
// app.component.ts
onThemeChange(theme: ThemeOption): void {
  this.themeService.setTheme(theme);
}
```

### Step 2: Service swaps the body class

```typescript
// theme.service.ts
setTheme(theme: ThemeOption): void {
  localStorage.setItem(STORAGE_KEY, theme.value);
  this.applyTheme(theme);
}

private applyTheme(theme: ThemeOption): void {
  THEMES.forEach(t => document.body.classList.remove(t.cssClass));
  document.body.classList.add(theme.cssClass);
  this.currentTheme$.next(theme);
}
```

After this call: `<body class="sapphire-theme">`

### Step 3: Two CSS systems respond simultaneously

1. **Material styles** — `body.sapphire-theme .mat-header-cell { ... }` activates via CSS specificity
2. **Custom properties** — `--theme-table-header-bg` resolves to the sapphire value; all `var()` references update

**This single class swap is the only runtime action.** No JavaScript recalculates colors. The browser's CSS engine does all the work.

### Persistence

The service saves the selection to `localStorage` under key `popout-theme`. On startup, the constructor restores it before the first render — no flash of wrong theme.

### Popout window support

Child windows opened via `window.open()` get the theme applied to their own `<body>`:

```typescript
applyToDocument(doc: Document): void {
  THEMES.forEach(t => doc.body.classList.remove(t.cssClass));
  doc.body.classList.add(this.current.cssClass);
}
```

---

## The Material SCSS API Reference (v15)

| Call | When | What it produces |
|---|---|---|
| `mat.core()` | Once, at root | Ripple, overlay, a11y foundational styles |
| `mat.define-palette(mat.$indigo-palette, 500, 100, 700)` | Build time | Palette map (no CSS emitted) |
| `mat.define-dark-theme((color: ..., typography: ..., density: ...))` | Build time | Theme config map (no CSS emitted) |
| `mat.define-typography-config($font-family, $headline-1, ...)` | Build time | Typography config map (no CSS emitted) |
| `mat.all-component-themes($theme)` | Once, for default | Full CSS: color + typography + density for all components |
| `mat.all-component-colors($theme)` | Per additional theme | Color-only CSS (no duplicate typography/density) |
| `mat.get-color-from-palette($palette, $hue)` | Build time | Extracts a single color value from a palette |

The key optimization: `all-component-themes()` is called once for the default theme. Additional themes use `all-component-colors()` which emits **only** the color diff.

---

## Summary Flow

```
User clicks dropdown
  → AppComponent.onThemeChange()
    → ThemeService.setTheme()
      → localStorage.setItem('popout-theme', 'sapphire')
      → document.body.classList = 'sapphire-theme'
        → CSS specificity activates body.sapphire-theme rules:
          → mat.all-component-colors() styles take effect on mat-table, mat-paginator, mat-sort
          → --theme-* custom properties resolve to sapphire values
            → var() references in component SCSS update (header bg, row colors, borders)
            → var() references in custom elements update (badges, clearance bars)
              → transition: 0.3s ease animates the change
```

No JavaScript color calculations. No component re-rendering. One class swap triggers a pure CSS cascade.

---

## Appendix: PrimeNG Dropdown Theming (Second Example)

The header's theme selector is a PrimeNG `<p-dropdown>` — a non-Material component. PrimeNG has its own theming system (CSS imports), but here it's overridden with the same CSS custom properties to stay consistent with the Material themes:

```scss
// app.component.scss — PrimeNG dropdown overrides
:host ::ng-deep .theme-selector {
  .p-dropdown {
    background: var(--theme-bg-input);
    border: 1px solid var(--theme-border);
    border-radius: 8px;

    &:hover {
      border-color: var(--theme-border-hover);
    }

    &.p-focus {
      border-color: var(--theme-border-focus);
      box-shadow: 0 0 8px var(--theme-accent-glow);
    }

    .p-dropdown-label {
      color: var(--theme-text-primary);
    }

    .p-dropdown-trigger {
      color: var(--theme-text-muted);
    }
  }
}
```

PrimeNG loads a base theme via CSS imports in `styles.scss`:

```scss
@import "primeng/resources/themes/lara-dark-blue/theme.css";
@import "primeng/resources/primeng.min.css";
@import "primeicons/primeicons.css";
```

The `lara-dark-blue` theme provides PrimeNG's default styling. The `::ng-deep` overrides above replace PrimeNG's colors with the app's CSS custom properties, so the dropdown follows the same theme switching as Material components — same body class, same `var()` resolution, same instant swap.

This pattern (PrimeNG base theme + CSS variable overrides) works because PrimeNG's selectors have lower specificity than the `:host ::ng-deep` overrides. No `!important` is needed for PrimeNG, unlike Material where the compiled theme styles have higher specificity.
