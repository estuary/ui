# test-schema-server

Test server to fetch [Airbyte connector](https://airbyte.io/connectors) schemas

Starts a server on port 3001 and has CORS setup for responses. It will

# How to start?

Just run `npm run start`

# /sources/all

A GET endpoint that returns a list of all the sources list in `appSources.js` (hardcoded list of known AirByte Connectors). This is passed back as an object with a `key` and `label`. The `label` is meant to be human readable and put into UIs. The `key` is meant to be passed back to the server to fetch details.

# /source/details/:sourceKey

A GET endpoint that expects the source key and will return the schema back. It will go through the following steps:

1. Try to read a stored copy from the `schema-local-cache` folder
2. Try to fetch a fresh copy from `ghcr.io/estuary/${name}:dev`
3. Try to fetch a fresh copy from `airbyte/${name}:latest`

If it hits number 2 or 3 then it will store the response in the `schema-local-cache` folder so it won't have to make the trip again.

The sourceKey sent over should look like `source-trello` or `source-amazon-ads`

# /captures/all

A GET endpoint that will return a simple array of all captures stored in the `captures-created` folder.

# /capture

A POST endpoint that will save off whatever is sent in the body. It saves a JSON files into the `captures-created` folder.
