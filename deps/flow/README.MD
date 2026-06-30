### What is this folder?

This folder houses the files we pull in from the [estuary/flow](https://github.com/estuary/flow/) project. 

The types should be used along with the server responses.

### How do we update the types?

Run `npm run generate-flow-types`, which will download the latest Flow binaries and generate the typescript types into `deps/flow/flow.d.ts`.

### How often do we update these files?

It is still undecided. Probably whenever the folks that "own" Flow tell us we need to update. This should not happen _all_ the time, but will be frequent enough we'll want to automate this. 
