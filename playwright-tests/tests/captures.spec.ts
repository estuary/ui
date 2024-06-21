import { expect, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    inituser,
    startSessionWithUser,
} from '../helpers/utils';
import { test_base } from '../fixtures/test';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    openDetailsFromTable,
    saveAndPublish,
    testConfig,
} from '../helpers/captures';

test_base.describe.serial('Captures:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const captureName = `${userName}/${uuid}/source-hello-world`;

    let page: Page;
    test_base.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultLocalStorage(page);
        await inituser(page, userName);
    });

    test_base('discover and publish', async () => {
        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
    });

    test_base('published can open details', async () => {
        await openDetailsFromTable(page, captureName);
    });

    test_base('details can open edit', async () => {
        await page.getByRole('button', { name: 'Edit' }).click();

        // Want to give a bit of time for the Endpoint Conig t load in
        await expect(
            page.getByRole('button', { name: 'Endpoint Config' })
        ).toBeVisible();
    });

    test_base('editing endpoint shows Next button', async () => {
        await page.getByRole('button', { name: 'Endpoint Config' }).click();
        await editEndpoint_HelloWorld(page, '12');
        await expect(
            page.getByRole('button', { name: 'Next', exact: true })
        ).toBeVisible();
    });

    test_base('undoing edits shows Save button', async () => {
        await editEndpoint_HelloWorld(page, '1');
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();
    });

    test_base('edits can be saved to update draft', async () => {
        await editEndpoint_HelloWorld(page, '123');
        await page.getByRole('button', { name: 'Next', exact: true }).click();
    });

    test_base('drafted changes can be tested', async () => {
        await testConfig(page);
    });

    test_base('drafted changes can be published', async () => {
        await saveAndPublish(page);
    });

    //     test_base('saved changes are visible on details spec', async () => {
    //     // fill in test here
    // });
});

const setting1 = 'Automatically keep schemas up';
const setting2 = 'Breaking changes re-version';
const setting3 = 'Automatically add new';
test_base.describe.serial('Schema Evolution Settings', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;

    let page: Page;
    test_base.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultLocalStorage(page);
        await inituser(page, userName);
    });

    test_base('discover', async () => {
        await discover_HelloWorld(page, uuid);
    });

    test_base('uncheck 1 = 1,2,3 unchecked', async () => {
        await page.locator('label').filter({ hasText: setting1 }).click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        await expect(
            page.locator('label').filter({ hasText: setting1 })
        ).toBeChecked({ checked: false });
        await expect(
            page.locator('label').filter({ hasText: setting2 })
        ).toBeChecked({ checked: false });
        await expect(
            page.locator('label').filter({ hasText: setting3 })
        ).toBeChecked({ checked: false });
    });

    test_base('check 1 = 1 checked', async () => {
        // All already unchecked so no need to reset

        await page.locator('label').filter({ hasText: setting1 }).click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();

        await expect(
            page.locator('label').filter({ hasText: setting1 })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: setting3 })
        ).toBeChecked({ checked: false });
        await expect(
            page.locator('label').filter({ hasText: setting2 })
        ).toBeChecked({ checked: false });
    });

    test_base('check 2 option = 1,2 checked', async () => {
        // Reset all to unchecked
        await page.locator('label').filter({ hasText: setting1 }).click();

        // Check and assert
        await page.locator('label').filter({ hasText: setting2 }).click();
        await expect(
            page.locator('label').filter({ hasText: setting1 })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: setting3 })
        ).toBeChecked({ checked: false });
        await expect(
            page.locator('label').filter({ hasText: setting2 })
        ).toBeChecked({ checked: true });
    });

    test_base('check 3 option = 1,3 checked', async () => {
        // Reset all to unchecked
        await page.locator('label').filter({ hasText: setting1 }).click();

        // Check and assert
        await page.getByText(setting3).click();
        await expect(
            page.locator('label').filter({ hasText: setting1 })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: setting3 })
        ).toBeChecked({ checked: true });
        await expect(
            page.locator('label').filter({ hasText: setting2 })
        ).toBeChecked({ checked: false });
    });
});
