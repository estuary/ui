# Estuary UI

The web UI for Estuary.

# How to start/run?

The UI runs against a local [Estuary](https://github.com/estuary/flow) stack, including its local Supabase instance. Make sure that stack is running first.

Then:

```
npm install
npm start
```

The app is served at [http://localhost:3000](http://localhost:3000).

## How to log in locally

1. On the login page, enter any email address and click **Sign in with Magic Link**.
2. Open the local email UI at [http://localhost:5434/](http://localhost:5434/) (Mailpit).
3. Copy the OTP code from the email, click **Already have an OTP code?** on the login page, and paste it in.
4. On first login you will be prompted to accept the terms of service and create an organization.

## Troubleshooting

### `data-plane-gateway` or `@estuary/flow-web` is outdated

Both are vendored tarballs in `__inline-deps__/`. Please see `__inline-deps__/README.md` for instructions.

# More documentation

Architecture, conventions, and gotchas live in [`docs/`](docs/).
