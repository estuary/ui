# WARNING

These tests will create A LOT of random users in Supabase. These are not cleaned up right now. To clean these up you'll need to restart your local Supabase.

## Queries to find all users related to tests

SELECT id
FROM auth.users
WHERE email ilike 'ui-test\_\_%'

# What do I need to run tests?

You need a full working flow locally. This means you need to start up flow, supabase, and the UI project first. This is using your ACTUAL local. This means it will be impacted by your local.

Also, you will need playwright browsers installed. This really depends on your system so you'l lneed to review their install docs.

# How should I approach writing/running tests?

These should NOT be used for anything like TDD. These are expected more to just make sure "nothing broke" and documenting how things work.

# How will these be maintained and structured?

No clue right now. This is made to be very ad-hoc and that is how they are right now. It is so easy to write tests with the Code Gen that we might end up not really doing a lot of code reuse here.

These tests are NOT made to test components or small scopes. These are meant to be larger tests that cover a lot of area. They are more like a user test and ensuring a full "workflow" is covered.
