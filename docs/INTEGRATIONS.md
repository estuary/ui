# External Integrations

## Supabase

PostgreSQL database, Edge Functions, and auth.

- Single anonymous client created in `GlobalProviders.tsx`
- Auth state synced to `UserStore` via `onAuthStateChange` listener
- Tables used: `live_specs`, `draft_specs`, `publications`, `tenants`, `auth_roles`
- RPCs used: `auth_roles`, `user_info_summary`, `view_logs`, `billing_report`
- REST queries wrapped in `src/api/` for error handling and retry logic
- Integrated with SWR via `@supabase-cache-helpers/postgrest-swr` (LRU cache, 500-entry limit)

**Gotcha:** LogRocket must be initialized before the Supabase client. LogRocket patches `fetch` on init; if Supabase loads first its requests won't be captured. Both are initialized in `GlobalProviders.tsx` — order matters.

---

## GraphQL Server

Real-time catalog data (alerts, live specs, shard status).

- Configured via `VITE_GQL_URL` environment variable
- URQL client library
- Pagination via before/after cursors
- GraphiQL explorer available at `http://localhost:3000/test/gql` in development

See `docs/GRAPHQL.md` for the full migration status and usage patterns.

---

## Data-Plane-Gateway

Task and shard management.

- Bundled as a local `.tgz` file in `__inline-deps__/`
- Provides `ShardClient` for journal data (logs, metrics)
- 3-second timeout on `list()` operations

**Gotcha:** Data-plane tokens expire. Check `shouldRefreshToken()` on errors and re-authenticate before retrying the request.

---

## Monaco Editor

Code editing for JSON/SQL; also used for rendering schemas, data previews, and advanced config views.

- Workers must be configured in `src/index.tsx` **before** React renders — this is already done, do not move it
- Custom worker setup for JSON language services (see `MonacoEnvironment` in `src/index.tsx`)

---

## LogRocket

Session recording for support and debugging.

- **Must initialize before Supabase** to capture network requests (see Supabase section above)
- Initialized in `GlobalProviders.tsx`
- Error boundaries report to LogRocket via `logRocketEvent(CustomEvents.ERROR_BOUNDARY_DISPLAYED)`
