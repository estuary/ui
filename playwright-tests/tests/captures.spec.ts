import { expect, test, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    defaultPageSetup,
    inituser,
    openDetailsFromTable,
    startSessionWithUser,
} from '../helpers/utils';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    saveAndPublish,
    testConfig,
} from '../helpers/captures';

test.describe.serial('Captures:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const captureName = `${userName}/${uuid}/source-hello-world`;

    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(page, userName);
    });

    test('discover and publish', async () => {
        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
    });

    test('published can open details', async () => {
        await openDetailsFromTable(page, captureName, 'captures');
    });

    test('details can open edit', async () => {
        await page.getByRole('button', { name: 'Edit' }).click();

        // Want to give a bit of time for the Endpoint Conig t load in
        await expect(
            page.getByRole('button', { name: 'Endpoint Config' })
        ).toBeVisible();
    });

    test('editing endpoint shows Next button', async () => {
        await page.getByRole('button', { name: 'Endpoint Config' }).click();
        await editEndpoint_HelloWorld(page, '12');
        await expect(
            page.getByRole('button', { name: 'Next', exact: true })
        ).toBeVisible();
    });

    test('undoing edits shows Save button', async () => {
        await editEndpoint_HelloWorld(page, '1');
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible();
    });

    test('edits can be saved to update draft', async () => {
        await editEndpoint_HelloWorld(page, '123');
        await page.getByRole('button', { name: 'Next', exact: true }).click();
    });

    test('drafted changes can be tested', async () => {
        await testConfig(page);
    });

    test('drafted changes can be published', async () => {
        await saveAndPublish(page);
    });

    //     test('saved changes are visible on details spec', async () => {
    //     // fill in test here
    // });
});

const setting1 = 'Automatically keep schemas up';
const setting2 = 'Breaking changes re-version';
const setting3 = 'Automatically add new';
test.describe.serial('Schema Evolution Settings', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;

    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultLocalStorage(page);
        await inituser(page, userName);
    });

    test('discover', async () => {
        await discover_HelloWorld(page, uuid);
    });

    test('uncheck 1 = 1,2,3 unchecked', async () => {
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

    test('check 1 = 1 checked', async () => {
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

    test('check 2 option = 1,2 checked', async () => {
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

    test('check 3 option = 1,3 checked', async () => {
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
