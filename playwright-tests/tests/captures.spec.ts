import { beforeEach } from 'node:test';

import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    testConfig,
} from '../helpers/captures';
import { AuthProps } from '../helpers/types';
import { USER_PREFIX, USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    defaultPageSetup,
    inituser,
    openDetailsFromTable,
    saveAndPublish,
    startSessionWithUser,
} from '../helpers/utils';
import { expect, Page, test } from '@playwright/test';

const defaultBackfillMessage = 'no bindings marked for backfill';

test.describe.serial('Captures:', () => {
    const uuid = crypto.randomUUID().split('-')[0];

    let captureName: string;
    let authProps: AuthProps;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        authProps = await defaultPageSetup(page, test, USERS.captures);
        captureName = `${authProps.name}/${uuid}/source-hello-world`;

        await page.getByLabel('Admin').click();
    });

    test('discover, publish, go to details', async () => {
        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
        await expect(page.getByText('Capture Details')).toBeVisible();

        await page.waitForURL(`**/details/**`);
    });

    test('details can open edit', async () => {
        await page.getByRole('button', { name: 'Edit' }).click();

        // Want to give a bit of time for the Endpoint Conig to load in
        await expect(
            page.getByRole('button', { name: 'Endpoint Config' })
        ).toBeVisible();
    });

    test('status of backfill is shown next to the "Backfill All" button', async () => {
        const backfillAllButton = page
            .locator('div')
            .filter({ hasText: /^Backfill$/ })
            .getByRole('button');

        const backfillCounter = page.getByLabel('Backfill count');

        // Checking defailt
        await expect(backfillCounter).toHaveScreenshot();

        // Ensuring backfill all shows status
        await backfillAllButton.click();
        await expect(backfillCounter).toHaveScreenshot();

        // Disabling all backfills and checking status
        await backfillAllButton.click();
        await expect(backfillCounter).toContainText(defaultBackfillMessage);
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
        await expect(page.getByText('Capture Details')).toBeVisible();
    });

    test.fixme('entity table can open details', async () => {
        await openDetailsFromTable(page, captureName, 'captures');

        await expect(
            page.getByRole('heading', { name: RegExp(captureName) })
        ).toBeVisible();
    });

    //     test('saved changes are visible on details spec', async () => {
    //     // fill in test here
    // });
});

const setting1 = 'Automatically keep schemas up';
const setting2 = 'Changing primary keys';
const setting3 = 'Automatically add new';
test.describe.serial('Schema Evolution Settings', () => {
    const uuid = crypto.randomUUID().split('-')[0];

    let authProps: AuthProps;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultLocalStorage(page);
        authProps = await defaultPageSetup(
            page,
            test,
            `${USERS.captures}__schema-evolution`
        );
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
