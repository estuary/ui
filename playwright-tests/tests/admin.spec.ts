import { AuthProps } from '../helpers/types';
import { USERS } from '../helpers/users';
import { defaultPageSetup } from '../helpers/utils';
import { expect, Page, test } from '@playwright/test';

const invalidEmail = 'Fake_Invalid_Email';
const testTokens = ['test token 1', 'test token 2', 'test token 3'];

test.describe.serial.only('Admin:', () => {
    const uuid = crypto.randomUUID().split('-')[0];

    let authProps: AuthProps;
    let page: Page;
    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        authProps = await defaultPageSetup(page, test, USERS.admin);

        await page.getByLabel('Admin').click();
    });

    test.describe('Account Access', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Account Access' }).click();
        });

        test('Organization table shows user has admin access', async () => {
            const table = await page.getByLabel(
                'Organization Membership Table'
            );
            await expect(table).toContainText(authProps.name);
            await expect(table).toContainText('admin');
            await expect(table).toContainText(authProps.tenant);
        });

        test('default data sharing with support', async () => {
            const table = await page.getByLabel('Data Sharing Table');
            await expect(table).toContainText(authProps.tenant);
            await expect(table).toContainText('estuary_support');
        });
    });

    test.describe('Settings', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Settings' }).click();
        });

        test('The authProps.tenant will be preselected', async () => {
            await expect(
                page.getByLabel('Prefix', { exact: true })
            ).toHaveValue(`${authProps.tenant}/`);
        });

        test('Organization Notifications Table', async () => {
            await expect(
                page.getByText('Organization Notifications')
            ).toBeVisible();
            await expect(
                page
                    .getByRole('columnheader', { name: 'Catalog Prefix' })
                    .first()
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Alert Types' }).first()
            ).toBeVisible();
            await expect(
                page
                    .getByRole('columnheader', { name: 'Notification Method' })
                    .first()
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Actions' }).first()
            ).toBeVisible();
        });

        test('Collection Storage Table', async () => {
            await expect(page.getByText('Collection Storage')).toBeVisible();
            await expect(
                page
                    .getByRole('columnheader', { name: 'Catalog Prefix' })
                    .first()
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Data Planes' }).first()
            ).toBeVisible();
            await expect(
                page
                    .getByRole('columnheader', { name: 'Primary Store' })
                    .first()
            ).toBeVisible();
            await expect(
                page
                    .getByRole('columnheader', { name: 'Storage Prefix' })
                    .first()
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Last Updated' }).first()
            ).toBeVisible();
        });

        test('Data Planes Table', async () => {
            await expect(
                page.locator('div').filter({ hasText: /^Data Planes$/ })
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Name' }).first()
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Region' }).first()
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'IPv4' }).first()
            ).toBeVisible();
        });
    });

    test.describe('Billing', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Billing' }).click();
        });

        test('shows details about the free tier', async () => {
            await expect(page.locator('#root')).toContainText(
                'The free tier lets you try Estuary with up to 2 tasks and 10GB per month'
            );
        });

        test('shows the authProps.tenant in the selector', async () => {
            await expect(
                page.getByRole('combobox', { name: 'Prefix' })
            ).toHaveValue(`${authProps.tenant}/`);
        });
    });

    test.describe('Connectors', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'Connectors' }).click();
        });

        test('contain the default connectors', async () => {
            await expect(
                page.getByRole('button', {
                    name: 'Docs Recommended Hello World',
                })
            ).toBeVisible();

            await expect(
                page.getByRole('button', {
                    name: 'Docs Recommended PostgreSQL Capture',
                })
            ).toBeVisible();
            await expect(
                page.getByRole('button', {
                    name: 'Docs Recommended PostgreSQL Materialization',
                })
            ).toBeVisible();

            await expect(
                page.getByRole('link', { name: 'New Connector To request a' })
            ).toBeVisible();
        });
    });

    test.describe('Cli-API', () => {
        test.beforeAll(async () => {
            await page.getByRole('tab', { name: 'CLI-API' }).click();
        });

        test('The token table should be empty', async () => {
            await expect(page.getByLabel('Entity Table')).toContainText(
                'No refresh tokens found.'
            );
        });

        test('can open generate token dialog', async () => {
            await page.getByRole('button', { name: 'Generate Token' }).click();
            await expect(
                page.getByRole('heading', { name: 'Generate Refresh Token' })
            ).toBeVisible();
        });

        test('can create a new token', async () => {
            await page.getByLabel('Description *').click();
            await page.getByLabel('Description *').fill(testTokens[0]);
            await page.getByRole('button', { name: 'Generate Token' }).click();
            await expect(
                page.getByText('Make sure to copy your')
            ).toBeVisible();
        });

        test('can create two more tokens', async () => {
            await page.getByLabel('Description *').click();
            await page.getByLabel('Description *').fill(testTokens[1]);
            await page.getByRole('button', { name: 'Generate Token' }).click();
            await page.getByLabel('Description *').click();
            await page.getByLabel('Description *').fill(testTokens[2]);
            await page.getByRole('button', { name: 'Generate Token' }).click();
        });

        test('can close the dialog', async () => {
            await page.getByRole('button', { name: 'Close' }).click();
            await expect(
                page.getByLabel('Generate Refresh Token')
            ).not.toBeVisible();
        });

        test.describe('can remove all tokens', async () => {
            testTokens.forEach(async (testToken) => {
                test(`${testToken} removed`, async () => {
                    await page
                        .getByRole('row', { name: testToken })
                        .getByRole('cell', { name: 'Remove' })
                        .click();
                    await expect(
                        page.getByLabel('Entity Table')
                    ).not.toContainText(testToken);
                });
            });
        });

        test('after all removed table should be empty', async () => {
            await expect(
                page.getByLabel('Generate Refresh Token')
            ).not.toBeVisible();
        });
    });
});
