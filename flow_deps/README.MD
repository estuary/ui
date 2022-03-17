### What is this folder?
This folder houses the files we pull in from the [estuary/flow](https://github.com/estuary/flow/) project. 

The types should be used along with the server responses.

### How do we update the types?
For this you'll need `flowctl` installed and the Flow project pulled locally. In the root of the flow project you will need to run the following command:
`flowctl schemalate typescript --name catalog --hoist-definitions < flow.schema.json > flow.d.ts`

After that you need to copy the `flow.d.ts` file into the `flow_deps` folder.

### How often do we update these files?
It is still undecided. Probably whenever the folks that "own" Flow tell us we need to update. This should not happen _all_ the time, but will be frequent enough we'll want to automate this. 