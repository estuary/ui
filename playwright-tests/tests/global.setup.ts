import { raiseTaskQuota } from '../helpers/db';
import { ensureSourceCollection } from '../helpers/materializations';
import { USERS } from '../helpers/users';
import { defaultPageSetup, saveSession } from '../helpers/utils';
import { test as setup } from '@playwright/test';

// Runs before the tests. Each user signs in once here, and tests restore these
// sessions, since users signing in at once would race for each other's
// emailed codes. Shared data that tests reuse is created here for the same
// reason.

const SESSION_USERS = [
    USERS.captures,
    `${USERS.captures}__schema-evolution`,
    USERS.collections,
    USERS.materializations,
];

for (const user of SESSION_USERS) {
    setup(`sign in ${user}`, async ({ browser }) => {
        setup.setTimeout(240000);

        const page = await browser.newPage();
        const { tenant } = await defaultPageSetup(page, setup, user);

        // Restoring may refresh the session, which replaces its refresh
        //  token, so tests get the latest one
        await saveSession(page, setup, user);
        await raiseTaskQuota(tenant);

        if (user === USERS.materializations) {
            await ensureSourceCollection(page, tenant);
        }

        await page.close();
    });
}
