import { expect, test, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    defaultPageSetup,
    inituser,
    openDetailsFromTable,
    startSessionWithUser,
    saveAndPublish,
} from '../helpers/utils';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    testConfig,
} from '../helpers/captures';
import { messageDescription, timeDescription } from './props';

test.describe.serial('Materializations:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const materializationName = `${userName}/${uuid}/materialize-postgres`;
    const collectionName = `${userName}/${uuid}/events`;

    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(page, userName);
        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
    });

    test('able to view an empty table', async () => {
        await page.goto(`http://localhost:3000/materializations`);
        await expect(
            page.getByRole('heading', { name: 'Click "New Materialization"' })
        ).toBeVisible();
    });

    test('start creating a PostgreSQL', async () => {
        await page.getByRole('button', { name: 'New Materialization' }).click();
        await page.getByRole('button', { name: 'Docs PostgreSQL' }).click();

        await page.getByLabel('Name *').click();
        await page.getByLabel('Name *').fill(uuid);
    });

    test('fill in connection details', async () => {
        await page.getByLabel('Address *', { exact: true }).click();
        await page
            .getByLabel('Address *', { exact: true })
            .fill(process.env.postgres_path);

        await page.getByLabel('User *', { exact: true }).click();
        await page
            .getByLabel('User *', { exact: true })
            .fill(process.env.postgres_user);

        await page.getByLabel('Password *', { exact: true }).click();
        await page
            .getByLabel('Password *', { exact: true })
            .fill(process.env.postgres_pass);

        await page.getByLabel('Database', { exact: true }).click();
        await page
            .getByLabel('Database', { exact: true })
            .fill(process.env.postgres_db);
    });

    test('select a collection for binding', async () => {
        await page.getByLabel('Add Collections').click();
        await page.getByText(collectionName).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByLabel('Table *')).toHaveValue('events');
    });

    test('the collection spec can be viewed', async () => {
        await page.getByRole('tab', { name: 'Collection' }).click();
        await expect(
            page.getByRole('cell', { name: '/message' })
        ).toBeVisible();
        await expect(page.getByRole('cell', { name: '/ts' })).toBeVisible();
    });

    test('the collection spec can be viewed in the editor', async () => {
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await expect(page.getByRole('code')).toContainText(messageDescription);
        await expect(page.getByRole('code')).toContainText(timeDescription);
    });

    test('show instructions to keep spec in sync with changes through CLI', async () => {
        await page.getByRole('button', { name: 'CLI' }).click();
        await expect(
            page.getByText('flowctl draft author --source')
        ).toBeVisible();
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test('can generate the spec', async () => {
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expect(
            page.getByRole('button', { name: 'Save and publish' })
        ).toBeVisible({ timeout: 30000 });
    });

    test('can refresh the fields', async () => {
        await page.getByRole('tab', { name: 'Config' }).click();
        await page.getByRole('button', { name: 'Refresh' }).click();
        await expect(page.getByRole('button', { name: 'Refresh' })).toBeEnabled(
            { timeout: 30000 }
        );

        await expect(
            page.getByLabel('Field Selection Editor')
        ).toHaveScreenshot();
    });

    test('can save and publish', async () => {
        await saveAndPublish(page);
        await expect(page.getByText('Materialization Details')).toBeVisible();
    });

    test('published can open details', async () => {
        await openDetailsFromTable(
            page,
            materializationName,
            'materializations'
        );
    });
});
