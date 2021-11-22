# test-schema-server

Test server to fetch [Airbyte connector](https://airbyte.io/connectors) schemas

Starts a server on port 3001 and has CORS setup for responses. It will

# How to install?

Start by running `npm install`. We use [node-pty](https://github.com/microsoft/node-pty) as a dependency and that [might require extra steps](https://github.com/microsoft/node-pty/blob/main/README.md#dependencies) in some environments.

Once stuff is installed you then need to configure where you flow development directory is located. Edit the `flowDevDirectory` const in the `server.js` file.

# How to start?

Just run `npm run start`

# /sources/all

A GET endpoint that returns a list of all the sources list in `appSources.js` (hardcoded list of known AirByte Connectors). This is passed back as an object with a `key` and `label`. The `label` is meant to be human readable and put into UIs. The `key` is meant to be passed back to the server to fetch details.

# /source/details/:sourceKey

A GET endpoint that expects the source key and will return the schema back. It will go through the following steps:

_What happens when called:_

1. Try to read a stored copy from the `schema-local-cache` folder
2. Try to fetch a fresh copy from `ghcr.io/estuary/${name}:dev`
3. Try to fetch a fresh copy from `airbyte/${name}:latest`

If it hits number 2 or 3 then it will store the response in the `schema-local-cache` folder so it won't have to make the trip again.

The sourceKey sent over should look like `source-trello` or `source-amazon-ads`

# /capture

A POST endpoint that will create a config YAML file in the `flowDevDirectory` you set.

_What happens when called:_

1. Check if this capture has been made before
1. Create new folder with the capture name
1. Create new config yaml with settings provided in UI
1. Run a `flowctl discover` command on newly created config
1. Return the generated Flow catalog to UI as JSON

# /captures/all

A GET endpoint that returns list of all configs stores in the `capturesDirectory` you set.
