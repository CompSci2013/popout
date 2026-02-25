# BUG-001: Portal-Rendered Component Shares Parent's Singleton Service

## Summary

When an Angular component is rendered into a popout window via CDK `DomPortalOutlet`, it shares the parent window's dependency injection context. A `providedIn: 'root'` singleton service that was initialized as "parent" cannot be re-initialized as "popout" by the portal-rendered component — the initialization guard blocks it.

## Symptom

- Popout window opens and renders the component visually
- Typing in the popout input does nothing — text does not sync back to the main window
- Typing in the main window input does nothing — text does not sync to the popout
- No errors in console

## Root Cause

`PopOutContextService` is `providedIn: 'root'` (singleton). The `HomeComponent` calls `popOutContext.initializeAsParent()` during `ngOnInit`, which sets `this.initialized = true` and prepares the service for parent-side operation.

When `TilePopoutComponent` is rendered via portal, it runs in the **parent window's Angular context** — same injector, same zone, same change detection tree. When the component calls `popOutContext.initializeAsPopOut(panelId)`, the guard `if (this.initialized) return;` fires because the service was already initialized as parent.

Result: the popout component's `sendMessage()` calls go through the parent's channel (which sends messages to itself), and no cross-window communication occurs.

```
// PopOutContextService (singleton)
initializeAsPopOut(panelId: string): void {
  if (this.initialized) {  // ← true, because initializeAsParent() already ran
    return;                 // ← silently returns, popout channel never created
  }
  // ... never reaches here
}
```

In the old route-based architecture, each popout window bootstrapped a fresh Angular app with its own injector tree, so each window got its own `PopOutContextService` instance. The portal approach eliminates the separate bootstrap — which is the goal — but means singleton services are shared.

## Fix

Removed `PopOutContextService` from `TilePopoutComponent` entirely. The component no longer needs cross-window messaging infrastructure because it lives in the parent's Angular context.

Instead:
- **Popout → Parent**: Component emits via `@Output() textChanged` EventEmitter. The `PopOutManagerService.wireComponentOutputs()` subscribes to it and relays events through `messagesSubject`.
- **Parent → Popout**: `PopOutManagerService.updatePopoutData(panelId, key, value)` sets properties directly on the component instance via `componentRef.instance`.

This is simpler and faster than BroadcastChannel — direct object references instead of serialized messages.

## Lesson

When migrating from route-based popouts (separate app instances) to portal-based popouts (shared context):
- Any service that distinguishes "am I parent or popout?" via initialization flags will break
- Any service that creates per-window resources (channels, subscriptions) will collide
- The portal-rendered component should communicate via Angular's standard mechanisms (@Output, @Input, services scoped to the component) rather than cross-window APIs
