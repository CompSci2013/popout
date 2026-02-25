# Bug 001: Shared Singleton in Portal Context

## Problem
When using `DomPortalOutlet` to pop out a component, the component remains in the parent window's Angular injection tree. If the component depends on a service that is provided at the component level (e.g., `providers: [MyService]`), it gets a new instance as expected. However, if it depends on a singleton provided in `root` (e.g., `AuthService`), it shares the **exact same instance** as the parent window.

## Impact
If the user logs out in the parent window, the popout component's `AuthService` also reflects the logged-out state immediately. While usually desirable, this can lead to race conditions where the parent window redirects to `/login` and destroys the portal before the popout window can gracefully close.

## Workaround
Ensure that the `PopoutManagerService` handles `AppRef` destruction and detaches all portals explicitly before the parent window completes its logout redirect.
