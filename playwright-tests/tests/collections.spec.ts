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
import { messageDescription, timeDescription } from './props';

test.describe.serial('Collections:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const collectionName = `${userName}/${uuid}/events`;

    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(page, userName);
        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
    });

    test('can open the details page from the table', async () => {
        await openDetailsFromTable(page, collectionName, 'collections');
        await expect(page.getByText(collectionName)).toBeVisible();
    });

    test('can view the spec as a table', async () => {
        await page.getByRole('tab', { name: 'Spec' }).click();

        await expect(page.locator('tbody')).toContainText(messageDescription);
        await expect(page.locator('tbody')).toContainText(timeDescription);
    });

    test('can view the spec as code', async () => {
        await page.getByRole('tab', { name: 'Spec' }).click();
        await page.getByRole('button', { name: 'Code' }).click();

        await expect(page.getByRole('code')).toContainText(messageDescription);
        await expect(page.getByRole('code')).toContainText(timeDescription);
    });

    test('can materialize from the details page', async () => {
        await page.getByRole('button', { name: 'Materialize' }).click();

        await page.getByRole('button', { name: 'Docs PostgreSQL' }).click();

        await expect(
            page.getByRole('button', { name: collectionName })
        ).toBeVisible();
        await expect(page.getByLabel('Table *')).toHaveValue('events');
    });
});
