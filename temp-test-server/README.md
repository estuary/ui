# test-schema-server
Test server to fetch Airbyte connector schemas

Starts a server on port 3001

Has CORS setup.

Can respond with a set of test schemas that are hardcoded into the system.

# /source/all
Returns a list of all the hardcoded schemas that are setup. Used to put them into a dropdown list and fetch the schemas later

# /source/details/:sourceKey
Send over the source key to get the schema back. Has to be one of the hardcoded provided in the list from /source/all

# /source/dynamic/:sourceName
This will go fetch a fresh copy of the schema from the docker hub of Airbyte. Sometimes this breaks since the Docker command does not always return proper JSON. 

