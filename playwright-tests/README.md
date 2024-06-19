# WARNING

These tests will create A LOT of random users in Supabase. These are not cleaned up right now.

## See all users

SELECT id
FROM auth.users
WHERE email ilike 'ui-test\_\_%'

## See all applied directives

select \*
from applied_directives A
WHERE A.user_id IN (SELECT id
FROM auth.users
WHERE email ilike 'ui-test\_\_%');

To clean these up you'll need to restart your local Supabase
