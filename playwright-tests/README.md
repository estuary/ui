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

You need a full working flow locally. This means you need to start up flow, supabase, and the UI project first. This is using your ACTUAL local. This means it will be impacted by your local.

Also, you will need playwright browsers installed. This really depends on your system so you'l lneed to review their install docs.

# How should I approach writing/running tests?

These should NOT be used for anything like TDD. These are expected more to just make sure "nothing broke" and documenting how things work.

It is probably best to refresh you local before writing/running these. This makes it so the tests do not need to try to manage all the little differences that can creep in on each developer's local.

# Some of the tests fail a lot

Since these are using your real local they also can have issues running all at the same time. This is because your local might not be able to keep up with the demand of running multiple users at the same time. Often, if you want to test something you should mark the suite you want with an `only` and stay focused on one suite at a time.

# How will these be maintained and structured?

No clue right now. This is made to be very ad-hoc and that is how they are right now. It is so easy to write tests with the Code Gen that we might end up not really doing a lot of code reuse here.

These tests are NOT made to test components or small scopes. These are meant to be larger tests that cover a lot of area. They are more like a user test and ensuring a full "workflow" is covered.
