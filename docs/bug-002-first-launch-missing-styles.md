# BUG-002: First-Launch Popout Missing Component Styles

## Summary

The first popout opened for a given component type renders without component-scoped styles. Closing and re-opening the same component type renders correctly. All subsequent launches are fine.

## Symptom

- First popout launch: raw unstyled content — emoji icon inline, plain white text, unstyled input (white box, no border-radius, no gradient background)
- Close popout, click again: fully styled — gradient card, icon in styled container, themed input with focus glow
- Every launch after the first works correctly

## Root Cause

Angular's ViewEncapsulation generates `<style>` tags with scoped attribute selectors (e.g., `[_ngcontent-abc-c42]`) and injects them into the parent document's `<head>` **on first component instantiation**. Before the component has ever been created, those `<style>` elements don't exist.

The original code order was:

```typescript
// 1. Write skeleton + copy ALL styles from parent <head>
this.writePopoutDocument(popoutWindow);  // ← copies styles HERE

// 2. Create portal outlet
const outlet = new DomPortalOutlet(popoutWindow.document.body, ...);

// 3. Attach component (Angular generates component styles NOW)
const componentRef = outlet.attach(portal);  // ← styles injected into parent <head> HERE
```

Step 1 copies styles before step 3 creates them. On first launch, the component's `<style>` tag doesn't exist yet in the parent `<head>`, so the copy misses it. On second launch, the styles from the first instantiation are already in the parent's `<head>`, so the copy captures them.

## Fix

Split into two operations and reorder:

```typescript
// 1. Write skeleton only (no styles)
this.writePopoutDocument(popoutWindow);

// 2. Attach component — Angular generates component styles into parent <head>
const outlet = new DomPortalOutlet(popoutWindow.document.body, ...);
const componentRef = outlet.attach(portal);

// 3. NOW copy styles (component styles exist)
this.copyStylesToPopout(popoutWindow);
```

The `writePopoutDocument()` method writes just the HTML skeleton and sets base body styles. The `copyStylesToPopout()` method copies all `<link>` and `<style>` elements from the parent's `<head>` — called after attachment so the component's encapsulated styles are present.

## Lesson

When using CDK `DomPortalOutlet` to render into a foreign document, Angular's lazy style injection means component styles only exist after first instantiation. Any style-copying logic must run **after** `outlet.attach()`, not before.
