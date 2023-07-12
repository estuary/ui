# Estuary UI

The web UI for Estuary Flow.

# How to install?

Make sure Node and npm are installed

Run: `npm install`

## I got a 401 error for `@estuary/flow-web`. 

You need to update `~/.npmrc` with the following:
```
//npm.pkg.github.com/:_authToken=__YOUR_AUTH_TOKEN_YOU_MADE_ON_GITHUB__
@estuary:registry=https://npm.pkg.github.com/
```

[Github docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token).

# How to start/run?

Run: `npm start`

The UI is built to hit our own instance of Supabase. That means you will need to have that running locally as well.

# Building Blocks

-   [MUI](https://mui.com/core/) for components
-   [Zustand](https://github.com/pmndrs/zustand) for local state
-   [JSON Forms](https://github.com/eclipsesource/jsonforms) for many forms
-   [SWR](https://github.com/vercel/swr) for server calls
