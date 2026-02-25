# Plan: Portal-Based Popout (No Full Bootstrap)

## Context

The current popout opens `/panel/:gridId/:panelId/:type` which bootstraps the **entire Angular app** in the new window. Auth guards re-evaluate in the fresh instance, redirecting to login.

The fix: open `about:blank`, copy styles, and use Angular CDK's `DomPortalOutlet` to render a real Angular component into the popout window's DOM — from the **parent window's Angular context**. No router, no guards, no second bootstrap. The component works normally (ngModel, *ngIf, pipes, DI — all functional).

`@angular/cdk` is already installed (`^13.3.9`). No new dependencies.

## Branch

`feature/portal-popout`

## How It Works

1. Parent calls `window.open('about:blank')`
2. Writes a minimal HTML skeleton into the popout (just `<body>` + copied stylesheets)
3. Creates a `DomPortalOutlet` targeting the popout's `document.body`
4. Attaches a `ComponentPortal<TilePopoutComponent>` — Angular renders the component into the foreign DOM
5. Change detection runs in the parent's zone — bindings, events, ngModel all work
6. On popout close, detaches the portal and cleans up

## Changes

### 1. `src/app/framework/services/popout-manager.service.ts` — rewrite `openPopOut()`

**Replace** the URL-based `window.open(url, ...)` with portal-based approach:

```typescript
import { ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { DomPortalOutlet, ComponentPortal } from '@angular/cdk/portal';

// In openPopOut():
const popoutWindow = window.open('about:blank', `panel-${panelId}`, windowFeatures);
// Write minimal doc + copy stylesheets
this.writePopoutDocument(popoutWindow);
// Create portal outlet targeting popout's body
const outlet = new DomPortalOutlet(
  popoutWindow.document.body,
  this.componentFactoryResolver,
  this.appRef,
  this.injector
);
// Attach the component
const portal = new ComponentPortal(componentType);
const ref = outlet.attach(portal);
// Set inputs on the component instance
ref.instance.tile = tile;
ref.instance.inputText = text;
```

Add `writePopoutDocument(win)` method that:
- Writes `<!DOCTYPE html><html><head></head><body></body></html>`
- Copies all `<link rel="stylesheet">` and `<style>` elements from parent `document.head` into the popout's `<head>`

Change `openPopOut()` signature to accept a component type + data instead of a URL string:
```typescript
openPopOut(panelId: string, componentType: Type<any>, data: any, features?: Partial<PopOutWindowFeatures>): boolean
```

**Keep** the existing BroadcastChannel setup and close-polling logic — those still work the same way.

Add new fields injected via constructor: `ComponentFactoryResolver`, `ApplicationRef`, `Injector`.

Store `DomPortalOutlet` in the `PopOutWindowRef` so it can be detached on close.

### 2. `src/app/framework/models/popout.interface.ts` — update PopOutWindowRef

Add `outlet: DomPortalOutlet` and `componentRef: ComponentRef<any>` fields to the interface.

### 3. `src/app/features/home/home.component.ts` — pass component type + data

Change `openPopOut()` call:
```typescript
// Before:
this.popOutManager.openPopOut(tile.id, `tile?text=${encodeURIComponent(text)}`, { ... });

// After:
this.popOutManager.openPopOut(tile.id, TilePopoutComponent, { tile, text: this.tileInputs[tile.id] }, { ... });
```

Import `TilePopoutComponent` at the top.

### 4. `src/app/features/tile-popout/tile-popout.component.ts` — simplify

Remove `ActivatedRoute` and `UrlStateService` dependencies (no longer routed). The component receives data via `@Input()` properties set by the portal host, and communicates back via `@Output()` or the existing BroadcastChannel.

Keep: `PopOutContextService`, ngModel binding, tile display logic, BroadcastChannel messaging.
Remove: route param parsing, URL state management.

### 5. `src/app/app-routing.module.ts` — remove popout route

Remove `{ path: 'panel/:gridId/:panelId/:type', component: TilePopoutComponent }`.

### 6. `src/app/app.component.ts` — remove popout detection

Remove router event subscription and `isPopout` flag. Always show chrome.

### 7. `src/app/app.component.html` — remove conditional chrome

Remove `*ngIf="!isPopout"` from header/footer.

### 8. `src/app/app.module.ts` — add PortalModule

Add `PortalModule` from `@angular/cdk/portal` to imports. Keep `TilePopoutComponent` in declarations (still an Angular component, just not routed).

### 9. `src/styles.scss` — remove popout body classes

Remove `.popout-body` and `.popout-html` rules (no longer needed — popout gets styles via copy).

## Files NOT changed

- `popout-context.service.ts` — still used for BroadcastChannel management
- Message types in `popout.interface.ts` — unchanged (just adding fields to WindowRef)

## Key Detail: Style Copying

The popout window starts as `about:blank` with no styles. The `writePopoutDocument()` method iterates over `document.head.querySelectorAll('link[rel="stylesheet"], style')` and clones each into the popout's `<head>`. This gives the component the same CSS environment as the parent.

## VVroom Feature Parity

VVroom's popouts also do a full Angular bootstrap (same `PopOutManagerService`, same BroadcastChannel). They work because auth isn't blocking the popout route. The portal approach matches or exceeds VVroom:

| Capability | VVroom (full bootstrap) | Portal approach |
|---|---|---|
| Real Angular components | Yes (7 types via ngSwitch) | Yes (any Type<any>) |
| ngModel, *ngIf, DI, pipes | Yes | Yes |
| BroadcastChannel sync | Yes (same service) | Yes (same service, kept) |
| Bidirectional messaging | Yes (8 message types) | Yes (same types) |
| Close detection (polling) | Yes (500ms) | Yes (same logic, kept) |
| Styles | Full CSS (same app) | Copied from parent |
| Auth guards | Depends on app config | Eliminated architecturally |
| Multiple component types | Yes (ngSwitch in template) | Yes (componentType param) |
| Popout makes own API calls | No (autoFetch=false) | No (component in parent zone) |
| Open speed | Slow (full bootstrap) | Fast (no bootstrap) |
| Memory per popout | Full app instance | Single component |

## Known Limitation

CDK overlays (dropdowns, tooltips) may position relative to the parent window's viewport, not the popout's. Not an issue for the current tile component.

## Verification

1. `cd ~/projects/popout && ng serve`
2. Click a tile → popout opens fast (no full app bootstrap, no route evaluation)
3. DevTools in popout: no `<app-root>`, no `<router-outlet>`, just the tile-popout component
4. `*ngIf`, `{{ interpolation }}`, `ngModel` all work in the popout
5. Type in popout → syncs to main window via BroadcastChannel
6. Type in main window → syncs to popout
7. Close popout → main window detects and restores tile
8. `ng build` succeeds with no errors
