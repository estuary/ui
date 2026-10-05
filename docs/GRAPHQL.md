# Overview

We are migrating from PostgREST to GQL for.

To prevent us from having to solve everything at once sticking with some ideas/approaches that DO NOT scale and we are fine with that right now. We will make things better slowly as we go and learn more about what we want this to look like.

# Decisions (as of Q4 2025)

## Typing

We use [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) with the `client` preset to automatically generate types from the schema and inline `graphql()` calls in source files.

- Generated output: `src/gql-types/` (auto-generated `gql.ts`, `graphql.ts`, `index.ts`)
- Scripts:
    - `npm run codegen` — generate types against the production GQL endpoint (via `.env`)
    - `npm run codegen:local` — generate types against a local GQL endpoint (via `.env.development.local`)
    - `npm run codegen:check` — run codegen and verify no uncommitted schema/type changes

Write new operations with the codegen `graphql()` function. Do not add hand-written `gql<>` template calls or manual result types.

When adding or changing `graphql()` queries/mutations/fragments in source files, re-run `npm run codegen` (or `codegen:local` if working against a local dev backend) to regenerate types.

**Never hand-resolve merge/rebase conflicts in `src/gql-types/`** — the files are deterministic codegen output. Clear the markers (`git checkout --theirs -- src/gql-types/`; either side is fine), run codegen, and `git add` the result. Caveat: codegen introspects a *live* backend, so the output only contains types that backend has. If a local backend is behind `main`, some types drop out — harmless when nothing in source references them; verify with `npm run typecheck`.

The `check-schema` script runs in CI to verify the committed schema and generated types are up to date with the production endpoint.

Legacy manual types may still exist in `src/types/gql.ts` and should be migrated to use the generated types over time.

## Client Library: URQL

This is our client solution primarily because it is very bare bones and seems to be easy to extend as we need.

## Helpers / Utils

The single fragment we have right now into a "service" for GQL (ui/src/services/gql.ts). However, it is doubtful that we will stick with this pattern in the long run.

## Hooks

There will be needed helpful hooks for sure (like pagination) but want to make sure there is better understanding on what they should be before making them. Currently the only component using GQL Pagination is the AlertHistory table (ui/src/components/tables/AlertHistory/index.tsx).

Strongly doubt we will go down the same path as with useSWR and write a bunch of wrappers around GQL as that just ended up just causing more issues than it fixed.

## Exploration

This will be powered by GraphiQL and is hosted from `flow` but can be accessed through the UI by going to [http://localhost:3000/test/gql](http://localhost:3000/test/gql)

# Open Items (as of Nov 13, 2025)

## Fetching Auth Roles

Look for `TODO (gql auth roles)` in the code.

### Impact

We know we want to fetch Auth Roles with GQL because it is MUCH faster. However, there is currently an issue where the GQL data is ~30 seconds behind. This can cause issues for non-support staff as sometimes we need to know _right away_ that a user has access.

A first time user will get a weird experience if we do not know their auth roles fairly quickly. They can interact with the dashboard and get around. However, if they try to create something they will get a `Missing required Access...` message. Any page with a "tenant selector" (welcome page or admin pages) will get weird because there are not tenants to select.

A user can click to see the demo tasks. If they do this without access we prompt them to accept access first. We need to know they have access right away

### Workaround

This should not impact normal users and only `support` staff. We have the `mutate` call just log an event so we can keep track of who would be impacted - but do nothing else. This has to be solved before we can roll this out to the wider audience.

## Graph Caching

Entity types are not yet normalized: the `keys` map in `src/context/URQL.tsx` returns `null` for them. The migration rules are in the comment on that map.

### Impact

Mutation results do not merge into cached queries. Mutations compensate with manual `invalidateQuery` updaters, and stale data can persist until the request-policy ttl refetches.

### Workaround

Migrate types to real keys as you touch them. Backend prerequisite for some updaters to go away: `updateAlertConfig` and `revokeRefreshToken` must return the mutated entity.
