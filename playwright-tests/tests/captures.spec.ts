import { expect, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import { inituser, startSessionWithUser } from '../helpers/utils';
import { test_base } from '../fixtures/test';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    openDetailsFromTable,
    saveAndPublish,
    testConfig,
} from '../helpers/captures';

test_base.describe.serial(
    'Captures can be discovered, published, and edit',
    () => {
        const uuid = crypto.randomUUID().split('-')[0];
        const userName = `${USERS.captures}_${uuid}`;
        const captureName = `${userName}/${uuid}/source-hello-world`;

        let page: Page;
        test_base.beforeAll(async ({ browser }) => {
            page = await browser.newPage();
            await inituser(page, userName);
        });

        test_base('discover the capture and then publish it', async () => {
            await discover_HelloWorld(page, uuid);
            await saveAndPublish(page);
        });

        test_base(
            'published captures can be seen in table and link to details',
            async () => {
                await openDetailsFromTable(page, captureName);
            }
        );

        test_base('published capture can be edited', async () => {
            await page.goto(
                `http://localhost:3000/captures/details/overview?catalogName=${encodeURIComponent(
                    captureName
                )}`
            );

            await page.getByRole('button', { name: 'Edit' }).click();

            await editEndpoint_HelloWorld(page, '12');
        });
    }
);

/*
test_base(
    'Capture edit config after discover requires new discover',
    async ({ page }) => {
        const uuid = crypto.randomUUID().split('-')[0];
        await inituser(page, `${USERS.captures}_${uuid}`);
        await discover_HelloWorld(page, uuid);
        await editEndpoint_HelloWorld(page, '12');
    }
);

test_base('Capture test Hello World', async ({ page }) => {
    const uuid = crypto.randomUUID().split('-')[0];
    await inituser(page, `${USERS.captures}_${uuid}`);
    await discover_HelloWorld(page, uuid);
    await testConfig(page);
});

// need to figure out how we'll pre-populate data for this
test_base('Capture edit saved capture', async ({ page }) => {
    const uuid = crypto.randomUUID().split('-')[0];
    await inituser(page, `${USERS.captures}_${uuid}`);
    await discover_HelloWorld(page, uuid);
    await saveAndPublish(page);

    // Go back to table and see new capture
    await page.getByLabel('Sources').click();
    await expect(page.getByText(uuid)).toBeVisible();

    // Open up edit
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(
        page.getByRole('heading', { name: 'Edit Capture' })
    ).toBeVisible();
    await expect(
        page.getByRole('heading', {
            name: 'Endpoint Config Expand to edit',
        })
    ).toBeVisible();

    // Open endpoint config, change, and make sure next shows up
    await page
        .getByRole('button', { name: 'Endpoint Config Expand to edit' })
        .click();
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('123');
    await expect(
        page.getByRole('button', { name: 'Next', exact: true })
    ).toBeVisible();

    // Edit config again to be the original and see the next button goes away
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('12');
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();

    // change again and actually save the changes
    await page.getByLabel('Message Rate *').click();
    await page.getByLabel('Message Rate *').fill('123');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Submit new changes
    await expect(
        page.getByRole('button', { name: 'Save and publish' })
    ).toBeVisible();
    await page
        .getByRole('button', { name: 'Save and publish', exact: true })
        .click();
    await expect(page.getByText('Edited Capture Saved')).toBeVisible();
});

*/

test_base(
    'The Schema Evolution settings default properly',
    async ({ page }) => {
        const uuid = crypto.randomUUID().split('-')[0];
        await inituser(page, `${USERS.captures}_${uuid}`);
        await discover_HelloWorld(page, uuid);

        // Deselecting 1
        await page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
            .click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        // Disabled 1,2,3
        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Automatically keep schemas up' })
        ).toBeChecked({ checked: false });
        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Breaking changes re-version' })
        ).toBeChecked({ checked: false });
        await expect(
            page.locator('label').filter({ hasText: 'Automatically add new' })
        ).toBeChecked({ checked: false });
        /////////////////////////

        //////////////////////////////
        // Selecting 1
        await page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
            .click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        await page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
            .click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        // Enables only 1
        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Automatically keep schemas up' })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: 'Automatically add new' })
        ).toBeChecked({ checked: false });
        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Breaking changes re-version' })
        ).toBeChecked({ checked: false });
        //////////////////////////////

        //////////////////////////////
        // Selecting 2 = enables 1 and 2
        await page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
            .click();
        await page.getByText('Automatically add new').click();

        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Automatically keep schemas up' })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: 'Automatically add new' })
        ).toBeChecked({ checked: true });
        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Breaking changes re-version' })
        ).toBeChecked({ checked: false });
        //////////////////////////////

        //////////////////////////////
        // Selecting 3 = enables 1 and 3
        await page
            .locator('label')
            .filter({ hasText: 'Automatically keep schemas up' })
            .click();
        await page
            .locator('label')
            .filter({ hasText: 'Breaking changes re-version' })
            .click();

        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Automatically keep schemas up' })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: 'Automatically add new' })
        ).toBeChecked({ checked: false });
        await expect(
            page
                .locator('label')
                .filter({ hasText: 'Breaking changes re-version' })
        ).toBeChecked({ checked: true });
    }
);
