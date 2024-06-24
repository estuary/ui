import { expect, test, Page } from '@playwright/test';
import { beforeEach } from 'node:test';
import { USERS } from '../helpers/users';
import {
    defaultLocalStorage,
    defaultPageSetup,
    emailDomain,
    inituser,
    startSessionWithUser,
} from '../helpers/utils';
import {
    discover_HelloWorld,
    editEndpoint_HelloWorld,
    saveAndPublish,
    testConfig,
} from '../helpers/captures';

test.describe.serial('Admin:', () => {
    const uuid = crypto.randomUUID().split('-')[0];
    const userName = `${USERS.captures}_${uuid}`;
    const captureName = `${userName}/${uuid}/source-hello-world`;
    const tenant = `${userName}/`;
    const userEmail = `${userName}${emailDomain}`;

    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await defaultPageSetup(page, userName);
        await page.getByLabel('Admin').click();
    });

    // TODO (tables - aria label)
    // These need fixed by making the tables have unique selectors.
    //   Should make the aria-label actually useful instead of always "entity table"
    test.describe.skip('Account Access', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Account Access' }).click();
        });

        test('shows user has access to tenant', async () => {
            await expect(
                page.getByText('Organization Membership')
            ).toBeVisible();
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(2)
            ).toContainText(userName);
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(3)
            ).toContainText('admin');
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(3)
            ).toContainText(tenant);
        });

        test('default data sharing with support', async () => {
            await expect(page.getByText('Data Sharing')).toBeVisible();
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(2)
            ).toContainText(tenant);
            await expect(
                page.locator('.MuiTableBody-root .MuiTableRow-root td').nth(3)
            ).toContainText('estuary_support');
        });
    });

    test.describe('Settings', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Settings' }).click();
        });
        test('shows user has access to tenant', async () => {
            await expect(
                page.getByRole('cell', { name: tenant }).first()
            ).toBeVisible();
            await page
                .getByRole('cell', { name: userEmail })
                .getByRole('list')
                .click();
            await page.getByRole('cell', { name: 'collection-data/' }).click();
        });
    });

    test.describe('Connectors', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Connectors' }).click();
        });

        test('contain the default connectors', async () => {
            await expect(
                page.getByRole('button', { name: 'Docs Hello World Capture' })
            ).toBeVisible();

            await expect(
                page.getByRole('button', { name: 'Docs PostgreSQL Capture' })
            ).toBeVisible();
            await expect(
                page.getByRole('button', {
                    name: 'Docs PostgreSQL Materialization',
                })
            ).toBeVisible();

            await expect(
                page.getByRole('link', { name: 'New Connector To request a' })
            ).toBeVisible();
        });
    });
});
