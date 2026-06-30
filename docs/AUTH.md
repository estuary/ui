# Authentication

## Overview

Auth is handled by Supabase. The flow is:

1. Supabase client is created in `GlobalProviders.tsx`
2. `UserStoreProvider` attaches an `onAuthStateChange` listener that writes session/user into a Zustand store
3. `GlobalProviders` blocks the app from rendering until the `INITIAL_SESSION` event fires
4. `RequireAuth` guards individual routes
5. The URQL auth exchange handles JWT refresh proactively (1 minute before expiry)
6. After login, `UserGuard` identifies the user to LogRocket

---

## Provider / Initialization Order

The full provider nesting in `src/context/index.tsx` (outermost → innermost):

```
ContentProvider              — IntlProvider for i18n
UpdateHelmetProvider         — document <title> management
PHProvider                   — PostHog analytics init
ThemeProvider                — MUI theme + dark/light mode
IconoirProvider              — icon size defaults
ErrorBoundryWrapper          — top-level error boundary
NotificationProvider         — toast/snackbar state
SwrConfigProvider            — SWR cache (500-entry LRU)
UrqlConfigProvider           — GraphQL client + auth exchange
UserStoreProvider            — attaches onAuthStateChange listener
GlobalProviders              — blocks render until initialized; creates Supabase client
SidePanelDocsProvider
TableSettingsProvider
  {children}
```

**Critical ordering rules:**

- `LogRocket.init()` is called inside `GlobalProviders` **before** `createClient()` — LogRocket must patch `fetch` before Supabase makes any requests
- `UrqlConfigProvider` must be inside `UserStoreProvider` so the URQL auth exchange can read the session from the Zustand store
- Monaco workers are configured in `src/index.tsx` **before** `AppProviders` renders

### Authenticated-only context

Once a user is authenticated, `AuthenticatedLayout` (used in router) adds a second layer:

```
AuthenticatedOnlyContext     — guards; initializes domain stores
AuthenticatedHydrators       — hydrates global entity/journal stores
OnLoadSpinner
PaymentMethodWarning
  AppLayout
    {route content}
```

---

## UserStore

**`src/context/User/useUserContextStore.ts`**

The Zustand store for auth state. Do not read `supabaseClient.auth.getUser()` directly in components — read this store instead.

```typescript
interface UserStore {
    initialized: boolean; // true after INITIAL_SESSION fires
    session: Session | null; // full Supabase Session
    user: User | null; // Supabase User object
    userDetails: UserDetails | null; // extracted metadata (see below)
}
```

`UserDetails` is extracted from the Supabase user object:

```typescript
{
    id: string;
    userName: string; // full_name from metadata, falls back to email
    email: string;
    emailVerified: boolean;
    avatar: string; // avatar_url
    usedSSO: boolean; // true if provider starts with 'sso'
}
```

Access via:

```typescript
const user = useUserStore((state) => state.user);
const initialized = useUserStore((state) => state.initialized);
```

---

## Auth State Listener

**`src/context/User/index.tsx`**

`UserStoreProvider` runs a single `useEffect` on mount that calls `supabaseClient.auth.onAuthStateChange`. It handles:

- **`INITIAL_SESSION`** — sets `initialized: true`, unblocking `GlobalProviders`
- **Session present** — writes `session`, `user`, `userDetails` into the store
- **No session (logout)** — clears store values, calls `postHog.reset()`

The listener is unsubscribed on unmount.

---

## GlobalProviders Guard

**`src/context/GlobalProviders.tsx`**

```typescript
function GlobalProviders({ children }) {
    const initialized = useUserStore((state) => state.initialized);
    if (!initialized) return <FullPageSpinner />;
    return <>{children}</>;
}
```

Nothing inside `GlobalProviders` (i.e., most of the app) renders until `initialized` is `true`.

---

## RequireAuth

**`src/context/Router/RequireAuth.tsx`**

Used on both authenticated and unauthenticated routes with different props:

| Scenario                                    | Props            | Behavior                                                 |
| ------------------------------------------- | ---------------- | -------------------------------------------------------- |
| Login/register page, user already logged in | `firstLoad`      | Redirects to home (or grant path if `checkForGrant`)     |
| Protected page, user not logged in          | _(no firstLoad)_ | Redirects to `/login` with `{ from: location }` in state |
| Correct state                               | —                | Renders children                                         |

The `from` location in state is used by the login page to redirect the user back after signing in.

---

## JWT Refresh (URQL)

**`src/context/URQL.tsx`**

The URQL `authExchange` handles token refresh for all GraphQL requests:

- **`willAuthError()`** — returns `true` if the token is missing or expires within 1 minute
- **`didAuthError()`** — detects 401 / `FORBIDDEN` GraphQL errors
- **`refreshAuth()`** — calls `supabaseClient.auth.refreshSession()`. The refreshed session is automatically picked up by the `onAuthStateChange` listener. If refresh fails, calls `forceUserToSignOut('gql')`.

---

## Auth Flows

### Email/password

`/login` → Supabase `signInWithPassword` → `onAuthStateChange` fires → app renders

### SSO

`/sso/login` or `/sso/register` → Supabase OAuth redirect → `/auth` callback page → `supabaseClient.auth.initialize()` parses URL params → `onAuthStateChange` fires

### Magic link (DEV ONLY)

`/magicLink` → email sent → link opens `/auth` → same callback path as SSO

### Access grants

Grant tokens (`?grantToken=...`) are passed through `RequireAuth` → `checkForGrant` prop → `getPathWithParams(home.path, { grantToken })` after login

---

## LogRocket User Identification

**`src/app/guards/User.tsx`**

After the user is set in the store, `UserGuard` calls `identifyUser(user)` once (guarded by a ref). This ties the LogRocket session to the specific user for support debugging.

```typescript
LogRocket.identify(user.id, { name, email });
```

Controlled by `logRocketSettings.idUser` config flags (name and email can be toggled off independently).
