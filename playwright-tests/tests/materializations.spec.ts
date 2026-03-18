import { beforeEach } from 'node:test';

import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    testConfig,
} from '../helpers/captures';
import { AuthProps } from '../helpers/types';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    defaultPageSetup,
    goToEntityPage,
    inituser,
    openDetailsFromTable,
    saveAndPublish,
    startSessionWithUser,
} from '../helpers/utils';
import { messageDescription, timeDescription } from './props';
import { expect, Page, test } from '@playwright/test';

test.describe.serial('Materializations:', () => {
    const uuid = crypto.randomUUID().split('-')[0];

    let authProps: AuthProps;
    let collectionName: string;
    let materializationName: string;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        authProps = await defaultPageSetup(page, test, USERS.materializations);
        materializationName = `${authProps.name}/${uuid}/materialize-postgres`;
        collectionName = `${authProps.name}/${uuid}/events`;

        await discover_HelloWorld(page, uuid);
        await saveAndPublish(page);
    });

    test('start creating a PostgreSQL', async () => {
        await goToEntityPage(page, 'materializations');

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

    // TODO (field selection) - we did a major update and need to make new tests
    test.skip('can refresh the fields', async () => {
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
