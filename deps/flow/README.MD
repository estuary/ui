### What is this folder?

This folder houses the files we pull in from the [estuary/flow](https://github.com/estuary/flow/) project.

The types should be used along with the server responses.

### How do we update the types?

Run `npm run generate-flow-types`. It reads the JSON schema of Flow catalog specs (`flow.schema.json` in the Flow repo) and generates the TypeScript types into `deps/flow/flow.d.ts`.

The schema comes from the Flow release pinned by `FLOW_RELEASE` in `generate-flow-types.mjs`, so regenerating gives the same types until that is bumped. To update the types for a newer Flow, bump `FLOW_RELEASE` to one of its [releases](https://github.com/estuary/flow/releases) and regenerate.

To generate from somewhere else, such as Flow's `master` or a local Flow checkout, set `FLOW_SCHEMA` to a URL or path:

```
FLOW_SCHEMA=../flow/flow.schema.json npm run generate-flow-types
```

### How often do we update these files?

It is still undecided. Probably whenever the folks that "own" Flow tell us we need to update. This should not happen _all_ the time, but will be frequent enough we'll want to automate this.
