# test-schema-server

Test server to fetch Airbyte connector schemas

Starts a server on port 3001 and has CORS setup for responses. It will

# How to start?

Just run `npm run start`

# /sources/all

Returns a list of all the sources available in the cache. This is passed back as an object with a `key` and `label`. The `label` is meant to be human readable and put into UIs. The `key` is meant to be passed back to the server to fetch details.

# /source/details/:sourceKey

Send over the source key to get the schema back. It will first try to server up one from the "cache" that is stored locally. If it cannot it will go fetch a fresh copy. It always puts latest and also ALWAYS stores the response in the `schema-local-cache` folder so it won't have to make the trip again.

The sourceKey sent over should look like "source-trello" or "source-amazon-ads"
