# Estuary UI

The web UI for Estuary Flow.

# How to install?

Ensure `Node` and `npm` are both installed

Run: `npm install`

## Troubleshooting

### 401 error for `@estuary/flow-web`

You need to update `~/.npmrc` with the following:

```
//npm.pkg.github.com/:_authToken=__YOUR_AUTH_TOKEN_YOU_MADE_ON_GITHUB__
@estuary:registry=https://npm.pkg.github.com/
```

[Github docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token).

### `data-plane-gateway` is outdated

Please see `__inline-deps__/README.md` for instructions

### Why don't I see logs locally?

You should get logs with V1 Control Plane. You just need to make sure the Ops Catalog is started.

With the update to V2 Control Plane the logs will no longer work in the UI by default. This is due to how the journal selectors for Logs are currently handled. We ned to know about a "pub id" to add to the selector. Currently there is no consistent way for the UI to fetch this.

To get logs you will need to grab this "pub id" and update the query... details TBD.

# How to start/run?

Make sure [Estuary Flow](https://github.com/estuary/flow) and [Supabase CLI](https://github.com/supabase/cli) are installed and running.

Run: `npm start`

The UI is built to hit our own instance of Supabase. That means you will need to have that running locally as well.

# How to test against prod?

Run: `npm run build`

then

Run : `npm run preview`

This will run a build and then start previewing it. When running as `preview` you will be running production mode - meaning all the code that runs in prod will be running.

# Stuff we use

- [TypeScript](https://github.com/microsoft/TypeScript) for code
- [MUI](https://github.com/mui/material-ui) for components
- [JSON Forms](https://github.com/eclipsesource/jsonforms) for forms
- [Apache ECharts](https://github.com/apache/echarts) for charts
- [Zustand](https://github.com/pmndrs/zustand) for local state
- [Supabase](https://github.com/supabase) for server calls
- [SWR](https://github.com/vercel/swr) for server calls
- [Vite](https://github.com/vitejs) for build
