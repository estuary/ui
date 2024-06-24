import { expect, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    inituser,
    openDetailsFromTable,
    startSessionWithUser,
} from '../helpers/utils';
import { test_base } from '../fixtures/test';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    saveAndPublish,
    testConfig,
} from '../helpers/captures';

const messageDescription = 'A human-readable message';
const timeDescription = 'The time at which this message was generated';
test_base.describe.serial('Collections:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const collectionName = `${userName}/${uuid}/events`;

    let page: Page;
    test_base.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultLocalStorage(page);
        await inituser(page, userName);
        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
    });

    test_base('can open the details page from the table', async () => {
        await openDetailsFromTable(page, collectionName, 'collections');
        await expect(page.getByText(collectionName)).toBeVisible();
    });

    test_base('can view the spec as a table', async () => {
        await page.getByRole('tab', { name: 'Spec' }).click();

        await expect(page.locator('tbody')).toContainText(messageDescription);
        await expect(page.locator('tbody')).toContainText(timeDescription);
    });

    test_base('can view the spec as code', async () => {
        await page.getByRole('tab', { name: 'Spec' }).click();
        await page.getByRole('button', { name: 'Code' }).click();

        await expect(page.getByRole('code')).toContainText(messageDescription);
        await expect(page.getByRole('code')).toContainText(timeDescription);
    });
});
