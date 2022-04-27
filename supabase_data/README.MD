### What is this folder?

This folder houses local copies of data that is fetched with Supabase. The main goal is to use this data in unit tests so they can run offline with realistic data. We do NOT check this data into the repo right now.

### How do we update the types?

First - you will need to update `supabase_data/fetch-connector_tags.sh` file with the proper API Key and Auth Key. You can get the API key from the `.env` file. You can find the Auth Key in the local storage after logging into the app on your local.

Second - run `npm run save-local-supabase-data`, which will query the database and store local copies of data as JSON documents.

### How often do we update these files?

#

It is still undecided. We need to figure out some cadence but the main thing we want to make sure is that we update at least as often as the Supbase schema changes.
