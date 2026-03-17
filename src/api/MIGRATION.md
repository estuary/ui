# API Migration: PostgREST → GraphQL

Everything in `api/` is built on PostgREST. We are migrating away from PostgREST to GraphQL.

New GraphQL-based modules live in `api/gql/`.

Once all PostgREST modules in `api/` have been migrated (and deleted), the contents of `api/gql/` can be promoted up to `api/` and the `gql/` subdirectory removed.
