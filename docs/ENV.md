# Environment Variables

## File Loading

Vite selects env files by mode. The two override files never load together:

- Dev server (mode `development`): `.env` + `.env.development.local`
- Vitest (mode `test`): `.env` + `.env.test`
- Production build (mode `production`): `.env` only

`playwright-tests/.env` is separate. Only the Playwright E2E suite reads it; Vite never loads it.

`.env.development.local` is committed with safe local values so a fresh clone runs out of the box. Do not put production secrets in any committed env file.

## Where Vars Are Read

Most vars are read in `src/utils/env-utils.ts`, which throws a named error when a required var is missing. The rest are read at a single call site — search for the var name. When you add a var, put a comment on it in `.env` and read it through `env-utils.ts`. Do not add var tables to this doc; `.env` and `env-utils.ts` are the catalog.
