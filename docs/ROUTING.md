# Routing

## Setup

Uses **React Router v6** (`createBrowserRouter` + `createRoutesFromElements`). The full router tree is defined in `src/context/Router/index.tsx`. Route path constants live in `src/app/routes.ts`.

Need to look into moving to the `Data` React Router mode. That way we could share a single source of truth for our routes.

---

## Route Constants (`src/app/routes.ts`)

All paths are defined as typed objects with `path` (relative) and `fullPath` (absolute) properties. Always reference these constants — do not hardcode path strings.

```typescript
import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';

// Navigate to a route:
navigate(authenticatedRoutes.captures.create.fullPath);

// Link to a route:
<Link to={authenticatedRoutes.materializations.edit.fullPath} />
```

### Authenticated routes

```
/                          home
/captures                  captures list
/captures/create/new       create capture
/captures/details          capture details
  /overview
  /spec
  /history
  /alerts
  /ops
/captures/edit             edit capture

/collections/...           same shape as captures
/materializations/...      same shape as captures

/admin/...                 admin pages (access grants, billing, etc.)
/beta/...                  beta features (may be phased out)
```

### Unauthenticated routes

```
/login
/register
/register/callback
/sso/login
/sso/register
/auth                      OAuth / magic-link callback handler
/logout
/magicLink
/marketplace/callback
```

---

## Route Guards

### `RequireAuth` — `src/context/Router/RequireAuth.tsx`

Placed on routes to control access:

```typescript
// On login/register pages — redirects already-authenticated users away
<Route element={<RequireAuth firstLoad checkForGrant><LoginPage /></RequireAuth>} />

// On protected pages — redirects unauthenticated users to /login
// (This is handled by AuthenticatedLayout, not per-route)
```

| Prop            | When used               | Effect                                                              |
| --------------- | ----------------------- | ------------------------------------------------------------------- |
| `firstLoad`     | Login / register routes | If user exists, redirect to home (or grant destination)             |
| `checkForGrant` | Auth callback           | After redirect, check for `?grantToken=` in URL                     |
| _(neither)_     | Protected routes        | If no user, redirect to `/login` with `{ from: location }` in state |

The `from` location is used by the login page to send users back to where they were trying to go.

---

## Layout Hierarchy

### Unauthenticated routes

```
Router
  Route (unauthenticated path)
    RequireAuth (firstLoad)
      <LoginPage> / <RegisterPage> / etc.
```

### Authenticated routes

```
Router
  Route (authenticated path)
    AuthenticatedLayout
      Authenticated
        AuthenticatedOnlyContext   — guards; initializes domain stores
        AuthenticatedHydrators     — hydrates global entity/journal stores
        OnLoadSpinner
        PaymentMethodWarning
          AppLayout                — nav sidebar + header
            Suspense
              <RouteComponent>
```

---

## Code Splitting

We do not split _all_ components due to a weird UX for when they are loading in. We generally keep all the paths that can be reached with a single click of the navigation in one chunk.

Deeper route components are lazy-loaded. Lazy imports and `<Suspense fallback={null}>` wrappers are centralized in `src/context/Router/index.tsx`. Do not add `lazy()` calls elsewhere.

```typescript
// Defined once at top of Router/index.tsx:
const CaptureCreateRoute = lazy(() => import('src/context/Router/CaptureCreate'));

// Used in the route tree:
<Suspense fallback={null}>
    <CaptureCreateRoute />
</Suspense>
```

---

## URL Search Params as State

Several pieces of state are stored in URL search params so they survive navigation and can be shared via link.

**Reading params:**

```typescript
import {
    GlobalSearchParams,
    useGlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);
const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);
```

**Adding params without navigation:**

```typescript
import { useSearchParamAppend } from 'src/hooks/searchParams/useSearchParamAppend';

const append = useSearchParamAppend();
append(GlobalSearchParams.CONNECTOR_ID, id);
```

**Building URLs with params:**

```typescript
import { getPathWithParams } from 'src/utils/misc-utils';

const url = getPathWithParams(authenticatedRoutes.home.fullPath, {
    grantToken,
});
```

---

## Route-Level State

Each workflow route (create/edit) initializes its own set of Zustand stores on mount:

- `useWorkflowStore` — overall workflow status (active step, form state)
- `useFormStateStore` — validation state, saving/testing status
- `useBindingStore` — binding configuration and errors
- `useEndpointConfigStore` — connector endpoint config

These stores are scoped per-session (not persisted). When navigating away from a route, stores are reset by setting `active: false`.

---

## App Guards

After authentication, a set of guards run before the main content renders (`src/app/guards/`):

| Guard            | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `UserGuard`      | Ensure we have user and identifies user to LogRocket |
| `LegalGuard`     | Checks legal agreement acceptance                    |
| `AnalyticsGuard` | Initializes PostHog user identification              |
| `GrantGuard`     | Processes access grant tokens from URL               |
| `TenantGuard`    | Ensures user has a valid tenant; redirects if not    |
