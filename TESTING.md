## UI/UX Testing

We have a lot of test cases we need to automate. While we work on getting those made we maintain this list of known cases you might want to test. You do not need to test all of these for every PR - use your best judgement.

This is not an exhaustive list by any means. As you find weird edge cases please add them here.

### Unit Testing

We have some unit tests but not much. Usually we prefer to just unit test helper/utils that have a more simple `input <-> output` format and are easy to test.

### E2E Testing

Our E2E tests are currently in the `playwright-tests` directory. The goal is eventually this becomes a stand alone project within the Estuary organization. As these tests are trully testing the entire application and not just the UI.

## Connectors to test

You will want to test a solid combination of different connectors that all can trigger different edges cases. You can also fake these locally my altering the Endpoint and Resource Configs. However, this will make saving them not work.

### Both

1. requires no `endpoint` config (???)
1. allows oAuth for authentication (Google Sheets)
1. uses a `descriminator` for a `anyOf` of `oneOf` (???)

### Captures

#### Bindings

1. returns a single binding (HelloWorld)
1. returns several bindings (Postgres)
1. returns inferred schema (WebHook)
1. returns TONS of bindings to check performance (Postgres w/ table that has +1k tables)

### Materializations

#### `Source` settings

1. supports `deltaUpdates` only (???)
1. supports `targetSchema` only (???)
1. supports both `deltaUpdates` `targetSchema` (???)
1. supports neither `deltaUpdates` `targetSchema` (Amazon S3 Parquet)

### Create Scenarios

During create you will need to worry about when you are editing with just local state stored in the browser vs when you are actually updating the draft spec. Normally you are updating the draft if there is a `Test` and `Save` cta visible in the header.

#### Both

1. happy path save
1. edit collection `schema` (just `schema` and `read`/`write` ones)

#### Capture

Captures are slightly more straight forward as they do not have a draft until things are discovered. So you do not need to worry _as much_ about testing these and then clicking `next` like Materializations.

1. edit collection keys
1. edit and then re-discover
1. failed discover
1. rename field on collection

#### Materialization

Materializations have a draft right away. However, we do not auto generate the spec so there is still a `next` cta showing like when you enter Capture.

You will want to _test all these before AND after_ clicking `next` cta.

1. happy path save with `materialize` cta
1. happy path save but WITHOUT bindings
1. refresh field select
1. set field select `groupBy`
1. setting `source.capture`
1. adding bindings
1. setting `source` defaults and adding bindings
1. removing bindings
1. happy path save with old collection using trial storage

### Edit Scenarios

You will want to do all the same testing as you do on Create - but just in the edit flow. During edit the user can also reload at anytime - so make sure you test with reloading at different times and ensuring your changes are still there and things are hydrating correctly

#### Both

1. happy path edit and save
1. edit `endpoint` config
1. `backfill` a single binding
1. `backfill` all bindings

#### Capture

1.

#### Materialization

### Special Cases

There are some "types" of connectors that we a little bit different need to be kept in mind.

#### Pydantic

`Pydantic` is a Python tool that is used by the Connectors team. It tends to output schemas that are technically correct but written in a manner that seems a bit "off" from how a person might generate them. The main thing that has hurt us before is how `Pydantic` handles `oneOf`, `anyOf`, and `discriminator`.

These can be [found here](https://github.com/search?q=repo%3Aestuary%2Fconnectors+path%3Asource-*%2Fpyproject.toml+%22pydantic+%3D%22&type=code) and should always be included in your testing.
