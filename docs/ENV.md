# Environment Variables

Vite exposes env vars prefixed with `VITE_` to client-side code via `import.meta.env`. Non-prefixed vars (e.g. `PORT`) are build/server-only and never bundled.

## File Loading Order

Vite loads files in this priority order (higher overrides lower):

1. `.env.development.local` — local developer overrides, not for production
2. `.env.test` — test runner overrides (Vitest)
3. `.env` — base values, production defaults

`playwright-tests/.env` is a separate file only used by the Playwright E2E suite.

> **Note:** `.env.development.local` is committed with safe local/test values so new developers get a working local setup out of the box. Never put real production secrets in this file.

## Why SO MANY settings???

We have a lot of basic stuff in the dashboard that are behind properties. This is a carry over from early in the project when we foresaw the possibility of a user running their own dashboard. That is why so much stuff could be disabled even though it never is.

## Enabling / Disabling settings

The standard approach for controlling if certain features are enabled is by checking specifically for "true" in the code. That way if the setting is _anything_ else it will count as being disabled.

So often the standard approach is:

```
# Setting Disabled
foo_enabled=

# Setting Enabled
foo_enabled=true
```

---

## Core App

| Key                       | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `PORT`                    | Dev server port                                            |
| `EXTEND_ESLINT`           | Extends the default CRA ESLint config (legacy CRA setting) |
| `VITE_DEFAULT_PAGE_TITLE` | Browser tab title shown during initial load                |
| `VITE_TRIAL_DURATION`     | Number of days in a free trial                             |

---

## Supabase (Auth + Database)

| Key                      | Description                       |
| ------------------------ | --------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL              |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public JWT key |

---

## API Endpoints

| Key                                 | Description                                            |
| ----------------------------------- | ------------------------------------------------------ |
| `VITE_GQL_URL`                      | GraphQL server URL                                     |
| `VITE_TASK_AUTHORIZATION_URL`       | Fetching access to read ops logs or stats for tasks    |
| `VITE_COLLECTION_AUTHORIZATION_URL` | Access to read ops logs for tasks                      |
| `VITE_ENTITY_STATUS_BASE_URL`       | Used on details pages to fetch status / related tasks  |
| `VITE_MARKETPLACE_VERIFY_URL`       | Endpoint for verifying GCP Marketplace subscriptions   |
| `VITE_DEFAULT_DATA_PLANE_SUFFIX`    | Default data-plane suffix appended to data-plane names |

---

## In-Dashboard Assistant (CopilotKit)

Experimental "explain log / feature / setup" assistant rendered in the authenticated layout. See `src/components/copilot/`.

| Key                        | Description                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `VITE_COPILOT_RUNTIME_URL` | CopilotKit runtime endpoint. Defaults to `http://localhost:4000/copilotkit` when unset (local dev).  |

**Local dev runtime.** The runtime is a small throwaway Node process under `dev/copilot-runtime/` that holds the LLM key server-side (the key never reaches the browser). Set it up and run it alongside `npm start`:

```bash
cp dev/copilot-runtime/.env.example dev/copilot-runtime/.env   # then add ONE provider key
npm run dev:copilot
```

Its own env (`dev/copilot-runtime/.env`, gitignored) holds the provider key and optional overrides. The provider is auto-selected: set `GEMINI_API_KEY` (Google AI Studio) to use **Gemini** (`GEMINI_MODEL`, default `gemini-2.5-flash`), or `ANTHROPIC_API_KEY` to use **Claude** (`ANTHROPIC_MODEL`, default `claude-opus-4-8`). Force one with `COPILOT_PROVIDER=google|anthropic`. Other overrides: `COPILOT_RUNTIME_PORT`, `COPILOT_ALLOWED_ORIGIN`.

**Shared demo.** To serve without a local runtime, point the provider at CopilotKit Cloud instead — swap `runtimeUrl` for `publicApiKey` in `src/components/copilot/Assistant.tsx` (free Developer tier; configure the Anthropic key in the Cloud dashboard).

---

## Authentication / Login UI

| Key                          | Description                           |
| ---------------------------- | ------------------------------------- |
| `VITE_SHOW_EMAIL_LOGIN`      | Show email login option               |
| `VITE_SHOW_SSO`              | Show SSO login option                 |
| `VITE_ALLOW_EMAIL_REGISTER`  | Allow new users to register via email |
| `VITE_URLS_PRIVACY_POLICY`   | URL to the privacy policy page        |
| `VITE_URLS_TERMS_OF_SERVICE` | URL to the terms of service page      |

---

## Encryption

| Key                   | Description                                        |
| --------------------- | -------------------------------------------------- |
| `VITE_ENCRYPTION_URL` | Endpoint for encrypting connector configs via SOPS |

---

## LogRocket

All values default to off in `.env.development.local` to prevent local sessions from polluting production session recordings.

| Key                                    | Description                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `VITE_LOGROCKET_ENABLED`               | Enable LogRocket session recording                                           |
| `VITE_LOGROCKET_APP_ID`                | LogRocket application ID                                                     |
| `VITE_LOGROCKET_URL`                   | CDN URL for the LogRocket script (defaults to standard LR URL if unset)      |
| `VITE_LOGROCKET_SERVER_URL`            | Custom ingest server URL for LogRocket (not implemented, for custom domains) |
| `VITE_LOGROCKET_ID_USER`               | Identify users in LogRocket sessions                                         |
| `VITE_LOGROCKET_ID_USER_INCLUDE_NAME`  | Include name when identifying users                                          |
| `VITE_LOGROCKET_ID_USER_INCLUDE_EMAIL` | Include email when identifying users                                         |
| `VITE_LOGROCKET_SANITIZE_REQUESTS`     | Sanitize outgoing network request bodies                                     |
| `VITE_LOGROCKET_SANITIZE_RESPONSES`    | Sanitize incoming network response bodies                                    |
| `VITE_LOGROCKET_SANITIZE_INPUTS`       | Sanitize form inputs in session recordings                                   |
| `VITE_LOGROCKET_SANITIZE_TEXT`         | Sanitize text content in session recordings                                  |
| `VITE_LOG_LR_EVENTS`                   | Print all `logRocketEvent()` calls to the console locally                    |

---

## PostHog (Product Analytics)

Disabled locally by default to avoid polluting production analytics data.

| Key                        | Description                      |
| -------------------------- | -------------------------------- |
| `VITE_PH_ENABLED`          | Enable PostHog analytics         |
| `VITE_PH_ID_USER`          | Identify users in PostHog        |
| `VITE_PH_PUBLIC_API_TOKEN` | PostHog project public API token |
| `VITE_PH_API_HOST`         | PostHog ingest host URL          |

---

## Google Tag Manager

Disabled locally by default.

| Key                               | Description                          |
| --------------------------------- | ------------------------------------ |
| `VITE_GOOGLE_TAG_MANAGER_ENABLED` | Allow fully disabling GTM is needed. |
| `VITE_GOOGLE_TAG_MANAGER_ID`      | GTM container ID                     |

---

## Docs

| Key                               | Description                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `VITE_DOCS_ORIGIN`                | Origin of the docs site, used for `postMessage` communication with the embedded docs iframe |
| `VITE_DOCS_IFRAME_STRING_INCLUDE` | Used for where to point iframe docs to if you need to test inline docs locally.             |

---

## Stripe

| Key                           | Description                       |
| ----------------------------- | --------------------------------- |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Test key for stripe local testing |

---

## Playwright E2E (`playwright-tests/.env`)

These vars are only used by the Playwright test suite and are not loaded by Vite.

| Key             | Description                                 |
| --------------- | ------------------------------------------- |
| `postgres_path` | Host and port of the test Postgres instance |
| `postgres_user` | Postgres user for test database access      |
| `postgres_pass` | Postgres password for test database access  |
| `postgres_db`   | Postgres database name used by tests        |
