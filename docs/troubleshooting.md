# Popout Troubleshooting

## Problem: Popout Window Shows Login/Redirect Instead of Component

### Symptom

The user is authenticated and viewing a guarded page. They click "Pop Out" on a panel. A new browser window opens but instead of rendering the intended component (e.g., a chart, picker, or results table), it shows the login page or a redirect to an unauthorized route.

The user already passed auth to reach the page with the popout button — so why does the popout window fail auth?

### Two Popout Architectures

This project currently uses a **route-based popout** that opens a URL within the same Angular SPA. The new window loads `index.html`, bootstraps the full `AppModule`, and the router renders the popout component. This means auth guards run again in a fresh app instance.

An alternative approach exists in the **ngraph** project (`~/projects/ngraph`), which uses Dockview's `addPopoutGroup()` with a **minimal HTML shell** — no Angular bootstrap at all. The popout window loads a lightweight `popout.html` containing only Dockview's library and reconstructs the panel from serialized state passed via `window.opener`.

| | Route-Based (this project) | Shell-Based (ngraph) |
|---|---|---|
| Popout URL | `/panel/:gridId/:panelId/:type` | `/popout.html` (static asset) |
| Angular bootstrap | Full `AppModule` in new window | None — no Angular in popout |
| Auth guards | Run again (fresh app instance) | Never triggered (no router) |
| How content renders | Router loads popout component | Dockview reconstructs panel from serialized state via `window.opener.__dockview_popout_state__` |
| State sync | BroadcastChannel (typed messages) | Dockview internal (parent ↔ popout group sync) |
| Auth problem | Yes — see below | No — auth is irrelevant to the popout window |

### Why the Shell-Based Approach Avoids This Problem Entirely

In ngraph's approach (`~/projects/ngraph/src/popout.html`):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Dockview Popout Window</title>
    <link href="styles.css" rel="stylesheet" />
    <script src="dockview-core.min.js"></script>
  </head>
  <body>
    <div id="dockview-container" style="width: 100vw; height: 100vh"></div>
    <script>
      window.addEventListener("DOMContentLoaded", () => {
        const container = document.getElementById("dockview-container");
        const dockview = new Dockview.DockviewComponent(container, {
          disableAutoResizing: false,
        });
        dockview.fromJSON(window.opener.__dockview_popout_state__);
      });
    </script>
  </body>
</html>
```

The popout window:
1. Loads a static HTML file (not the Angular app's `index.html`)
2. Includes only Dockview's library and CSS
3. Reads panel state from the parent window via `window.opener`
4. Renders the panel using Dockview's own rendering — no Angular, no router, no guards

This means auth never enters the picture. The popout is a **display surface** controlled by the parent window, not an independent application instance.

The parent window calls:
```typescript
dockviewApi.addPopoutGroup(newGroup, {
  position: { width: 800, height: 600, left: 100, top: 100 },
  popoutUrl: '/popout.html',
});
```

Dockview handles the lifecycle: moving the panel's DOM into the popout, syncing state, and returning it to the main window on close.

### Why the Route-Based Approach Has the Auth Problem

When this project opens a popout via `window.open('/panel/discover/picker/picker')`:

1. **Browser opens a new window** — loads `index.html` from the server
2. **Full Angular bootstrap runs** — `platformBrowserDynamic().bootstrapModule(AppModule)`
3. **Router evaluates `/panel/discover/picker/picker`** — hits `canActivate` guard
4. **Auth guard runs in the new window's context** — checks for auth state
5. **Auth state is empty** because the new `AuthService` instance was just created
6. **Guard returns false** — router redirects to `/login` or `/unauthorized`

### If Staying with Route-Based Popouts

If migrating to the shell-based approach is not feasible, the auth problem can be mitigated:

#### 1. Auth State Stored Only in Memory

If the auth service stores the token/session in a class property or in-memory store (e.g., a BehaviorSubject), the popout window gets a fresh instance with no token.

**Fix:** Store auth tokens in a persistent browser storage mechanism shared across windows of the same origin:
- `localStorage` — shared across all tabs/windows of the same origin
- `sessionStorage` — NOT shared (each window gets its own)
- Cookies — shared across all requests to the same domain

If you use `sessionStorage`, that is likely the problem. Switch to `localStorage` or cookies.

#### 2. Auth Guard on the Popout Route

If the popout route (`/panel/:gridId/:panelId/:type`) inherits or has its own `canActivate` guard, the guard runs before the component loads.

**Fix:** Either:
- Remove the guard from the popout route specifically
- Create a popout-aware guard that checks `localStorage`/cookies before redirecting
- Use a catch-all guard that distinguishes popout routes from regular navigation

```typescript
// Example: popout-aware guard
canActivate(route: ActivatedRouteSnapshot): boolean {
  // Check persistent storage, not in-memory auth state
  const token = localStorage.getItem('auth_token');
  if (token && this.isTokenValid(token)) {
    // Hydrate the auth service from persistent storage
    this.authService.setToken(token);
    return true;
  }
  return false;
}
```

#### 3. HTTP Interceptor Redirects on 401

An HTTP interceptor may catch a 401 response from an initial API call and redirect to login before the component even renders.

**Fix:** Ensure the interceptor attaches the auth token from persistent storage (localStorage/cookies), not from the in-memory auth service state.

#### 4. SSO/OAuth Redirect Flow

If auth uses an SSO provider (OIDC, OAuth2), the redirect flow may not complete silently in the popout window. The popout opens, the guard triggers an SSO redirect, and the user sees the SSO login page.

**Fix:** Use silent token renewal. Most OAuth libraries support `iframe`-based silent auth or checking for an existing SSO session cookie:
- `angular-oauth2-oidc`: `silentRefresh()` or `tryLoginCodeFlow()`
- `@auth0/auth0-angular`: `getTokenSilently()`
- MSAL: `acquireTokenSilent()`

#### 5. CSRF/Session Cookie Not Sent

If auth relies on session cookies, the popout window's requests may not include them if:
- The cookie has `SameSite=Strict` (won't be sent from a new window navigation)
- The cookie path doesn't match the popout route
- The cookie is HttpOnly and the JS auth check reads from a different source

**Fix:** Ensure session cookies use `SameSite=Lax` (or `None` with `Secure`) and the path is `/`.

### Recommended Path Forward

The shell-based approach (ngraph pattern) eliminates the auth problem architecturally rather than patching around it. The popout window never touches the Angular router, never instantiates auth services, and never hits guards. It's a dumb display surface that the parent window controls.

If the application already uses Dockview for panel layout, `addPopoutGroup()` with a minimal `popout.html` is the cleanest solution. If not using Dockview, the same pattern can be implemented manually: open `about:blank`, inject styles, and use `window.opener` or BroadcastChannel to pass rendered content.

### Quick Diagnostic (Route-Based)

Open browser DevTools in the popout window and check:

```javascript
// Is the token in localStorage? (should be there if parent set it)
localStorage.getItem('auth_token')

// Is the token in sessionStorage? (will be empty — that's the problem)
sessionStorage.getItem('auth_token')

// Are cookies present?
document.cookie
```

If `localStorage` has the token but the app still redirects, the auth service isn't reading from it on startup. If `localStorage` is empty, the parent app is using `sessionStorage` or in-memory storage.
