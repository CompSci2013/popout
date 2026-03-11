# How Theme Switching Works in This Application (No ThemeService)

## Overview

This variant replaces the dedicated `ThemeService` with a `UserPreferencesService` that treats theme preference as user data fetched from (and persisted to) a REST API. Theme switching operates through three cooperating layers:

1. **RxJS subscription** — `AppComponent` subscribes to `UserPreferencesService.getPreference$('theme')`, translates the raw string to a `ThemeOption`, and applies a CSS class on `<body>` as a side-effect
2. **Material SCSS theming** (`themes.scss`) — uses `@use '@angular/material' as mat` to define palettes and emit component styles per theme
3. **CSS custom properties** — bridge Material's SCSS output to non-Material elements (custom markup, status badges, layout chrome)

The key difference from the `ThemeService` approach: there is no service whose sole job is managing themes. Instead, theme preference flows through a general-purpose user preferences service as a plain key/value string (`"theme" → "dark"`), and the translation to CSS classes plus the body class swap both happen in the UI layer — `AppComponent` and a shared `theme.constants.ts` file.

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

## The Theme Switching Mechanism (Without ThemeService)

Instead of a dedicated `ThemeService`, this architecture uses `UserPreferencesService` — a general-purpose service that stores generic key/value pairs. It has no knowledge of themes, CSS classes, or the `ThemeOption` interface. The translation from a raw preference string like `"dark"` to a `ThemeOption` with a `cssClass` property happens in the UI layer.

### The separation of concerns

```
UserPreferencesService          theme.constants.ts              AppComponent
─────────────────────           ──────────────────              ────────────
Stores: [{ key, value }]        Defines: ThemeOption            Subscribes to raw string
Exposes: getPreference$()       Exports: THEMES array           Maps string → ThemeOption
Knows nothing about themes      Shared by App + PopOutManager   Swaps body CSS class
```

### Step 1: Service fetches generic user preferences on startup

```typescript
// user-preferences.service.ts — knows nothing about themes
export interface UserPreference {
  key: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private preferences$ = new BehaviorSubject<UserPreference[]>([]);

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  getPreference$(key: string): Observable<string | undefined> {
    return this.all$.pipe(
      map(prefs => prefs.find(p => p.key === key)?.value)
    );
  }

  getPreference(key: string): string | undefined {
    return this.preferences$.value.find(p => p.key === key)?.value;
  }

  setPreference(key: string, value: string): void {
    // Update in-memory array, notify subscribers, persist via API
    const current = [...this.preferences$.value];
    const idx = current.findIndex(p => p.key === key);
    if (idx >= 0) current[idx] = { key, value };
    else current.push({ key, value });
    this.preferences$.next(current);
    this.savePreferences(current);
  }

  private loadPreferences(): void {
    // GET /api/user/preferences (faked as a local JSON asset)
    this.http.get<UserPreference[]>('assets/user-preferences.json')
      .subscribe(prefs => {
        if (Array.isArray(prefs)) this.preferences$.next(prefs);
      });
  }
}
```

The API payload is a generic array:

```json
[
  { "key": "theme", "value": "dark" },
  { "key": "language", "value": "en" }
]
```

### Step 2: Theme constants define the mapping (UI-layer knowledge)

```typescript
// framework/constants/theme.constants.ts
export interface ThemeOption {
  label: string;
  value: string;
  cssClass: string;
}

export const THEMES: ThemeOption[] = [
  { label: 'Dark', value: 'dark', cssClass: 'dark-theme' },
  { label: 'Light', value: 'light', cssClass: 'light-theme' },
  { label: 'Crimson', value: 'crimson', cssClass: 'crimson-theme' },
  { label: 'Sapphire', value: 'sapphire', cssClass: 'sapphire-theme' }
];

export const DEFAULT_THEME = THEMES[0];
```

This file is imported by `AppComponent` and `PopOutManagerService` — never by `UserPreferencesService`.

### Step 3: AppComponent subscribes, translates, and applies body class

```typescript
// app.component.ts
import { UserPreferencesService } from './framework/services/user-preferences.service';
import { ThemeOption, THEMES, DEFAULT_THEME } from './framework/constants/theme.constants';

export class AppComponent implements OnInit, OnDestroy {
  themes: ThemeOption[] = THEMES;
  selectedTheme: ThemeOption = DEFAULT_THEME;
  private themeSub!: Subscription;

  constructor(private userPrefs: UserPreferencesService) {}

  ngOnInit(): void {
    // Subscribe to the raw "theme" string and translate it here
    this.themeSub = this.userPrefs.getPreference$('theme').subscribe(themeValue => {
      const match = THEMES.find(t => t.value === themeValue);
      const theme = match || DEFAULT_THEME;
      this.selectedTheme = theme;
      this.applyThemeToBody(theme);
    });
  }

  onThemeChange(theme: ThemeOption): void {
    // Persist the raw string — the subscription above reacts and applies it
    this.userPrefs.setPreference('theme', theme.value);
  }

  private applyThemeToBody(theme: ThemeOption): void {
    THEMES.forEach(t => document.body.classList.remove(t.cssClass));
    document.body.classList.add(theme.cssClass);
  }
}
```

The body class swap is a **side-effect of the RxJS subscription**, not a method call on a theme-specific service. The `THEMES.find()` lookup — translating `"sapphire"` into `{ cssClass: 'sapphire-theme' }` — happens here in the component, not in the service.

### Step 4: Two CSS systems respond simultaneously

1. **Material styles** — `body.sapphire-theme .mat-header-cell { ... }` activates via CSS specificity
2. **Custom properties** — `--theme-table-header-bg` resolves to the sapphire value; all `var()` references update

**This single class swap is the only runtime action.** No JavaScript recalculates colors. The browser's CSS engine does all the work.

### Persistence

Instead of `localStorage`, the preference is persisted via a REST API call (`PUT /api/user/preferences`). On startup, the service fetches preferences (`GET /api/user/preferences`). In this demo, the API is faked — the GET reads from `assets/user-preferences.json`, and the PUT logs to console.

The API payload is a generic key/value array — it can carry `theme`, `language`, `timezone`, or any future preference without changing the service interface.

In a real application, the API would store preferences in a database tied to the authenticated user. This means theme preference follows the user across devices and browsers, unlike `localStorage` which is device-local.

### Popout window support

Child windows opened via `window.open()` get the theme applied to their own `<body>`. The `PopOutManagerService` reads the raw preference string and does its own `THEMES.find()` lookup — same constants file, same translation logic:

```typescript
// popout-manager.service.ts
import { UserPreferencesService } from './user-preferences.service';
import { THEMES, DEFAULT_THEME } from '../constants/theme.constants';

private applyThemeToDocument(doc: Document): void {
  const body = doc.body;
  const themeValue = this.userPrefs.getPreference('theme');
  const theme = THEMES.find(t => t.value === themeValue) || DEFAULT_THEME;
  THEMES.forEach(t => body.classList.remove(t.cssClass));
  body.classList.add(theme.cssClass);
}
```

---

## Comparing the Two Approaches

| Aspect | ThemeService | UserPreferencesService |
|---|---|---|
| Who owns theme state? | Dedicated `ThemeService` with `BehaviorSubject<ThemeOption>` | General-purpose service with `BehaviorSubject<UserPreference[]>` |
| Service knows about themes? | Yes — stores `ThemeOption` objects | No — stores generic `{ key, value }` strings |
| Who translates to CSS class? | `ThemeService.applyTheme()` | `AppComponent` and `PopOutManagerService` (via `theme.constants.ts`) |
| Who swaps the body class? | `ThemeService.applyTheme()` | `AppComponent` subscription callback |
| Persistence | `localStorage` (client-only) | REST API (server-side, cross-device) |
| Theme change notification | `ThemeService.theme$` → `Observable<ThemeOption>` | `getPreference$('theme')` → `Observable<string \| undefined>` |
| Initial load | Constructor reads `localStorage` | Constructor fires `HttpClient.get()` for all preferences |
| Popout windows | `ThemeService.applyToDocument()` | `PopOutManagerService.applyThemeToDocument()` with `getPreference('theme')` + lookup |
| API payload | N/A (client-only) | `[{ "key": "theme", "value": "dark" }, ...]` |

Both approaches produce identical runtime behavior: one body class swap triggers the CSS cascade. The difference is architectural — where the state lives, who understands what a "theme" is, and how preferences are persisted.

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
  → AppComponent.onThemeChange(sapphireThemeOption)
    → UserPreferencesService.setPreference('theme', 'sapphire')
      → preferences$ BehaviorSubject updated: [{ key: 'theme', value: 'sapphire' }, ...]
        → getPreference$('theme') emits: 'sapphire'
          → AppComponent subscription fires:
            → THEMES.find(t => t.value === 'sapphire') → { cssClass: 'sapphire-theme' }
            → document.body.classList = 'sapphire-theme'
              → CSS specificity activates body.sapphire-theme rules:
                → mat.all-component-colors() styles take effect on mat-table, mat-paginator, mat-sort
                → --theme-* custom properties resolve to sapphire values
                  → var() references in component SCSS update (header bg, row colors, borders)
                  → var() references in custom elements update (badges, clearance bars)
                    → transition: 0.3s ease animates the change
      → savePreferences([{ key: 'theme', value: 'sapphire' }, ...])
        → PUT /api/user/preferences [{ "key": "theme", "value": "sapphire" }, ...]
```

No JavaScript color calculations. No component re-rendering. One class swap triggers a pure CSS cascade. The API call fires in parallel — it doesn't block the visual update.

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
