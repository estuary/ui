# WARNING

These tests can create A LOT of random users in Supabase. These are not cleaned up right now. To clean these up you'll need to restart your local Supabase db.

## Resetting Supabase

Run the following command in your flow root directory.

```
supabase db reset --db-url postgresql://postgres:postgres@localhost:5432/postgres
```

## Queries to find all users related to tests

```
SELECT id
FROM auth.users
WHERE email ilike 'ui-test\_\_%'
```

# What do I need to run tests?

You need a full working [flow locally](https://github.com/estuary/flow/tree/master/local). This means you need to start up flow, supabase, and the UI project first. This is using your ACTUAL local. Only write tests that set themselves up within the test (until have a test environment) otherwise they won't work on anyone else's system.

Also, you will need playwright browsers installed. This really depends on your system so you'll need to review their install docs.

# How should I approach writing/running tests?

These should NOT be used for anything like TDD. These are expected more to just make sure "nothing broke" and documenting how things work.

It is probably best to refresh you local before writing/running these. This makes it so the tests do not need to try to manage all the little differences that can creep in on each developer's local.

## Can I share users between tests?

If you place a file in `/tests/.auth/${userName}.json` and follow the `AuthFile` type in `helpers/types.ts` that tests will use that while logging in with that user name. This can be helpful to allow you to go manually create users, agree to legal terms, and create a tenant.

While logging in the tests store these files automatically. Then update them as they agree to legal terms and creating a tenant. To make sure nothing is lost we create backups everytime we make a change. This means the folder can get REALLY big if you don't keep an eye on. So remember to clean it up every once in awhile.

### WARNING

If you alter state on the server then it will be there on your next run. So if you alter state please make sure you clean it up. You can also use this to manually setup complex test cases and do it for a one-off user. If you do this please try to make sure the setup is done via a playwright test (that can be skipped) OR is documented in a read me. Something to allow future engineers to also be able to run these tests.

## Are you following Playwright's docs for this?

Nope - we are not. Playwright has some awesome functionality to share the local storage state and share the authentication state. However, we are not using that right now. Rolling our own can potentially allow us to do some clever stuff like manually setting up tests that are hard to automate.

There is a very good (like 99% chance) that we will end up using Playwright's built in stuff (along with some custom tweaks). So there is not a _huge_ amount of effort put into architecting the current sharing mechanisms.

# Some of the tests fail a lot

Since these are using your real local they also can have issues running all at the same time. This is because your local might not be able to keep up with the demand of running multiple users at the same time. Often, if you want to test something you should mark the suite you want with an `only` and stay focused on one suite at a time.

# How will these be maintained and structured?

No clue right now. This is made to be very ad-hoc and that is how they are right now. It is so easy to write tests with the Code Gen that we might end up not really doing a lot of code reuse here.

These tests are NOT made to test components or small scopes. These are meant to be larger tests that cover a lot of area. They are more like a user test and ensuring a full "workflow" is covered.
